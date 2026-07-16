import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, leadsTable } from "@workspace/db";
import {
  CreateLeadBody,
  UpdateLeadBody,
  GetLeadParams,
  UpdateLeadParams,
  DeleteLeadParams,
  ListLeadsQueryParams,
  ListLeadsResponseItem,
  GetLeadResponse,
  ListLeadsResponse,
  GetLeadStatsResponse,
  CreateLeadResponse,
  UpdateLeadResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/leads/stats", async (_req, res): Promise<void> => {
  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(leadsTable);

  const [recentResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(leadsTable)
    .where(sql`created_at > now() - interval '7 days'`);

  const byStatusRows = await db
    .select({
      label: leadsTable.status,
      count: sql<number>`count(*)::int`,
    })
    .from(leadsTable)
    .groupBy(leadsTable.status);

  const byTradeRows = await db
    .select({
      label: leadsTable.trade_type,
      count: sql<number>`count(*)::int`,
    })
    .from(leadsTable)
    .groupBy(leadsTable.trade_type);

  res.json(
    GetLeadStatsResponse.parse({
      total: totalResult?.count ?? 0,
      recent_count: recentResult?.count ?? 0,
      by_status: byStatusRows.map((r) => ({
        label: r.label ?? "unknown",
        count: r.count,
      })),
      by_trade: byTradeRows
        .filter((r) => r.label != null)
        .map((r) => ({ label: r.label!, count: r.count })),
    }),
  );
});

router.get("/leads", async (req, res): Promise<void> => {
  const query = ListLeadsQueryParams.safeParse(req.query);

  let leads;
  if (query.success && query.data.status) {
    leads = await db
      .select()
      .from(leadsTable)
      .where(eq(leadsTable.status, query.data.status))
      .orderBy(desc(leadsTable.created_at));
  } else if (query.success && query.data.trade_type) {
    leads = await db
      .select()
      .from(leadsTable)
      .where(eq(leadsTable.trade_type, query.data.trade_type))
      .orderBy(desc(leadsTable.created_at));
  } else {
    leads = await db
      .select()
      .from(leadsTable)
      .orderBy(desc(leadsTable.created_at));
  }

  res.json(ListLeadsResponse.parse(leads));
});

router.post("/leads", async (req, res): Promise<void> => {
  const parsed = CreateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [lead] = await db
    .insert(leadsTable)
    .values({
      business_name: parsed.data.business_name,
      business_website: parsed.data.business_website ?? null,
      contact_email: parsed.data.contact_email,
      contact_phone: parsed.data.contact_phone ?? null,
      trade_type: parsed.data.trade_type ?? null,
      city: parsed.data.city ?? null,
    })
    .returning();

  res.status(201).json(CreateLeadResponse.parse(lead));
});

router.get("/leads/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetLeadParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid lead id" });
    return;
  }

  const [lead] = await db
    .select()
    .from(leadsTable)
    .where(eq(leadsTable.id, params.data.id));

  if (!lead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  res.json(GetLeadResponse.parse(lead));
});

router.patch("/leads/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateLeadParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid lead id" });
    return;
  }

  const parsed = UpdateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof leadsTable.$inferInsert> = {};
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.google_rating !== undefined) updateData.google_rating = parsed.data.google_rating ?? null;
  if (parsed.data.google_review_count !== undefined) updateData.google_review_count = parsed.data.google_review_count ?? null;
  if (parsed.data.pagespeed_score !== undefined) updateData.pagespeed_score = parsed.data.pagespeed_score ?? null;

  const [lead] = await db
    .update(leadsTable)
    .set(updateData)
    .where(eq(leadsTable.id, params.data.id))
    .returning();

  if (!lead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  res.json(UpdateLeadResponse.parse(lead));
});

router.delete("/leads/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteLeadParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid lead id" });
    return;
  }

  const [lead] = await db
    .delete(leadsTable)
    .where(eq(leadsTable.id, params.data.id))
    .returning();

  if (!lead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
