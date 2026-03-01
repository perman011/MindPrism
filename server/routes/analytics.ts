import { Router, type Request, type Response, type NextFunction } from "express";
import { isAuthenticated } from "../replit_integrations/auth";
import { authStorage } from "../replit_integrations/auth/storage";
import { hasMinRole } from "@shared/models/auth";
import { analyticsEvents, books, userProgress, userActivityLog } from "@shared/schema";
import { users } from "@shared/models/auth";
import { db } from "../db";
import { sql, desc, gte, count, eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const analyticsCache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCached(key: string) {
  const entry = analyticsCache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return entry.data;
  }
  analyticsCache.delete(key);
  return null;
}

function setCache(key: string, data: any) {
  analyticsCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

const eventSchema = z.object({
  eventType: z.string().min(1).max(100),
  eventData: z.record(z.unknown()).optional().default({}),
  pageUrl: z.string().max(500).optional(),
  sessionId: z.string().max(100).optional(),
});

router.post("/events", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userId = user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parsed = eventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid event data", errors: parsed.error.flatten() });
    }

    const { eventType, eventData, pageUrl, sessionId } = parsed.data;

    await db.insert(analyticsEvents).values({
      userId,
      eventType,
      eventData,
      pageUrl,
      sessionId,
    });

    res.status(201).json({ message: "Event recorded" });
  } catch (error: any) {
    console.error("[analytics] Failed to record event:", error.message);
    res.status(500).json({ message: "Failed to record event" });
  }
});

const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  if (!user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const dbUser = await authStorage.getUser(user.claims.sub);
  if (!dbUser || !hasMinRole(dbUser.role, "admin")) {
    return res.status(403).json({ message: "Forbidden: admin role required" });
  }
  next();
};

router.get("/overview", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
  try {
    const rangeDays = Math.min(365, Math.max(1, parseInt(req.query.days as string) || 30));
    const cacheKey = `overview_${rangeDays}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const now = new Date();
    const rangeStart = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalUsersResult] = await db.select({ count: count() }).from(users);

    const [dauResult] = await db
      .select({ count: sql<number>`count(distinct ${analyticsEvents.userId})` })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, oneDayAgo));

    const [wauResult] = await db
      .select({ count: sql<number>`count(distinct ${analyticsEvents.userId})` })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, sevenDaysAgo));

    const [mauResult] = await db
      .select({ count: sql<number>`count(distinct ${analyticsEvents.userId})` })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)));

    const [totalBooksResult] = await db.select({ count: count() }).from(books);

    const [totalEventsResult] = await db.select({ count: count() }).from(analyticsEvents);

    const dailyActiveUsers = await db
      .select({
        date: sql<string>`date(${analyticsEvents.createdAt})`,
        count: sql<number>`count(distinct ${analyticsEvents.userId})`,
      })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, rangeStart))
      .groupBy(sql`date(${analyticsEvents.createdAt})`)
      .orderBy(sql`date(${analyticsEvents.createdAt})`);

    const engagementByDay = await db
      .select({
        date: sql<string>`date(${userActivityLog.createdAt})`,
        sessions: sql<number>`count(*)`,
        uniqueUsers: sql<number>`count(distinct ${userActivityLog.userId})`,
        avgDuration: sql<number>`coalesce(avg(${userActivityLog.sessionDuration}), 0)`,
      })
      .from(userActivityLog)
      .where(gte(userActivityLog.createdAt, rangeStart))
      .groupBy(sql`date(${userActivityLog.createdAt})`)
      .orderBy(sql`date(${userActivityLog.createdAt})`);

    const popularBooks = await db
      .select({
        bookTitle: sql<string>`coalesce(${books.title}, ${analyticsEvents.eventData}->>'bookTitle', 'Unknown')`,
        count: sql<number>`count(*)`,
      })
      .from(analyticsEvents)
      .leftJoin(books, sql`${analyticsEvents.eventData}->>'bookId' = ${books.id}`)
      .where(sql`${analyticsEvents.eventType} = 'book_open'`)
      .groupBy(sql`coalesce(${books.title}, ${analyticsEvents.eventData}->>'bookTitle', 'Unknown')`)
      .orderBy(sql`count(*) desc`)
      .limit(10);

    const signupTrend = await db
      .select({
        date: sql<string>`date(${users.createdAt})`,
        count: count(),
      })
      .from(users)
      .where(gte(users.createdAt, rangeStart))
      .groupBy(sql`date(${users.createdAt})`)
      .orderBy(sql`date(${users.createdAt})`);

    const eventBreakdown = await db
      .select({
        eventType: analyticsEvents.eventType,
        count: count(),
      })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, rangeStart))
      .groupBy(analyticsEvents.eventType)
      .orderBy(sql`count(*) desc`)
      .limit(20);

    const [funnelSignup] = await db.select({ count: count() }).from(users);
    const [funnelOnboarded] = await db
      .select({ count: sql<number>`count(distinct ${analyticsEvents.userId})` })
      .from(analyticsEvents)
      .where(sql`${analyticsEvents.eventType} = 'onboarding_complete'`);
    const [funnelBookOpened] = await db
      .select({ count: sql<number>`count(distinct ${analyticsEvents.userId})` })
      .from(analyticsEvents)
      .where(sql`${analyticsEvents.eventType} = 'book_open'`);
    const [funnelCardViewed] = await db
      .select({ count: sql<number>`count(distinct ${analyticsEvents.userId})` })
      .from(analyticsEvents)
      .where(sql`${analyticsEvents.eventType} IN ('card_view', 'card_swipe', 'page_view')`);

    const funnel = [
      { stage: "Signed Up", count: Number(funnelSignup.count) || 0 },
      { stage: "Onboarded", count: Number(funnelOnboarded.count) || 0 },
      { stage: "Opened Book", count: Number(funnelBookOpened.count) || 0 },
      { stage: "Engaged", count: Number(funnelCardViewed.count) || 0 },
    ];

    const result = {
      totalUsers: totalUsersResult.count,
      dau: Number(dauResult.count) || 0,
      wau: Number(wauResult.count) || 0,
      mau: Number(mauResult.count) || 0,
      activeUsers7d: Number(wauResult.count) || 0,
      totalBooks: totalBooksResult.count,
      totalEvents: totalEventsResult.count,
      dailyActiveUsers,
      engagementByDay,
      popularBooks,
      signupTrend,
      eventBreakdown,
      funnel,
    };

    setCache(cacheKey, result);
    res.json(result);
  } catch (error: any) {
    console.error("[analytics] Overview error:", error.message);
    res.status(500).json({ message: "Failed to fetch analytics overview" });
  }
});

router.get("/admin-events", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const eventType = (req.query.type as string) || "";

    const whereClause = eventType
      ? eq(analyticsEvents.eventType, eventType)
      : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(analyticsEvents)
      .where(whereClause);

    const events = await db
      .select()
      .from(analyticsEvents)
      .where(whereClause)
      .orderBy(desc(analyticsEvents.createdAt))
      .limit(limit)
      .offset(offset);

    const eventTypes = await db
      .select({ eventType: analyticsEvents.eventType })
      .from(analyticsEvents)
      .groupBy(analyticsEvents.eventType)
      .orderBy(analyticsEvents.eventType);

    res.json({
      events,
      eventTypes: eventTypes.map((e) => e.eventType),
      pagination: {
        page,
        limit,
        total: totalResult.count,
        totalPages: Math.ceil(totalResult.count / limit),
      },
    });
  } catch (error: any) {
    console.error("[analytics] Events list error:", error.message);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

router.get("/admin-events/export", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
  try {
    const eventType = (req.query.type as string) || "";
    const whereClause = eventType
      ? eq(analyticsEvents.eventType, eventType)
      : undefined;

    const allEvents = await db
      .select()
      .from(analyticsEvents)
      .where(whereClause)
      .orderBy(desc(analyticsEvents.createdAt));

    const headers = ["ID", "User ID", "Event Type", "Page URL", "Session ID", "Created At"];
    const rows = allEvents.map((e) => [
      e.id,
      e.userId || "",
      e.eventType,
      e.pageUrl || "",
      e.sessionId || "",
      e.createdAt ? new Date(e.createdAt).toISOString() : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=analytics-events-${new Date().toISOString().split("T")[0]}.csv`);
    res.send(csvContent);
  } catch (error: any) {
    console.error("[analytics] Export error:", error.message);
    res.status(500).json({ message: "Failed to export events" });
  }
});

export default router;
