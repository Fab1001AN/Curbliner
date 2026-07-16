import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leadsTable = pgTable("leads", {
  id: serial("id").primaryKey(),
  business_name: text("business_name").notNull(),
  business_website: text("business_website"),
  contact_email: text("contact_email").notNull(),
  contact_phone: text("contact_phone"),
  trade_type: text("trade_type"),
  city: text("city"),
  google_rating: text("google_rating"),
  google_review_count: text("google_review_count"),
  pagespeed_score: text("pagespeed_score"),
  status: text("status").notNull().default("new"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leadsTable).omit({
  id: true,
  created_at: true,
  google_rating: true,
  google_review_count: true,
  pagespeed_score: true,
  status: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leadsTable.$inferSelect;
