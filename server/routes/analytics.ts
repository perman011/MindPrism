import { Router, type Request, type Response, type NextFunction } from "express";
import { isAuthenticated } from "../replit_integrations/auth";
import { authStorage } from "../replit_integrations/auth/storage";
import { hasMinRole } from "@shared/models/auth";
import { analyticsEvents, books, userProgress } from "@shared/schema";
import { users } from "@shared/models/auth";
import { db } from "../db";
import { sql, desc, gte, count, eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

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

router.get("/overview", isAuthenticated, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalUsersResult] = await db.select({ count: count() }).from(users);

    const [activeUsersResult] = await db
      .select({ count: sql<number>`count(distinct ${analyticsEvents.userId})` })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, sevenDaysAgo));

    const [totalBooksResult] = await db.select({ count: count() }).from(books);

    const dailyActiveUsers = await db
      .select({
        date: sql<string>`date(${analyticsEvents.createdAt})`,
        count: sql<number>`count(distinct ${analyticsEvents.userId})`,
      })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, thirtyDaysAgo))
      .groupBy(sql`date(${analyticsEvents.createdAt})`)
      .orderBy(sql`date(${analyticsEvents.createdAt})`);

    const popularBooks = await db
      .select({
        bookId: analyticsEvents.eventData,
        count: sql<number>`count(*)`,
      })
      .from(analyticsEvents)
      .where(sql`${analyticsEvents.eventType} = 'book_open'`)
      .groupBy(analyticsEvents.eventData)
      .orderBy(sql`count(*) desc`)
      .limit(10);

    const signupTrend = await db
      .select({
        date: sql<string>`date(${users.createdAt})`,
        count: count(),
      })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo))
      .groupBy(sql`date(${users.createdAt})`)
      .orderBy(sql`date(${users.createdAt})`);

    const [totalEventsResult] = await db.select({ count: count() }).from(analyticsEvents);

    const eventBreakdown = await db
      .select({
        eventType: analyticsEvents.eventType,
        count: count(),
      })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, thirtyDaysAgo))
      .groupBy(analyticsEvents.eventType)
      .orderBy(sql`count(*) desc`)
      .limit(20);

    res.json({
      totalUsers: totalUsersResult.count,
      activeUsers7d: activeUsersResult.count,
      totalBooks: totalBooksResult.count,
      totalEvents: totalEventsResult.count,
      dailyActiveUsers,
      popularBooks,
      signupTrend,
      eventBreakdown,
    });
  } catch (error: any) {
    console.error("[analytics] Overview error:", error.message);
    res.status(500).json({ message: "Failed to fetch analytics overview" });
  }
});

router.get("/admin-events", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;

    const [totalResult] = await db.select({ count: count() }).from(analyticsEvents);

    const events = await db
      .select()
      .from(analyticsEvents)
      .orderBy(desc(analyticsEvents.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      events,
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

export default router;
