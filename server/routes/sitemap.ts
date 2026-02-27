import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { books } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const baseUrl = process.env.REPLIT_DOMAINS
    ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
    : "https://mindprism.io";

  const publishedBooks = await db
    .select({ id: books.id, updatedAt: books.updatedAt })
    .from(books)
    .where(eq(books.status, "published"));

  const staticPages = [
    { loc: "/", changefreq: "daily", priority: "1.0" },
  ];

  const urls = staticPages
    .map(
      (p) =>
        `  <url>
    <loc>${baseUrl}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
    )
    .concat(
      publishedBooks.map(
        (b) =>
          `  <url>
    <loc>${baseUrl}/book/${b.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${b.updatedAt ? `\n    <lastmod>${new Date(b.updatedAt).toISOString().split("T")[0]}</lastmod>` : ""}
  </url>`,
      ),
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.set("Content-Type", "application/xml");
  res.send(xml);
});

export default router;
