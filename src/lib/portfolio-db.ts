import { randomUUID } from "crypto";
import { supabase } from "./supabase";

export interface NavEntry {
  id: string;
  date: string;
  nav: number;
  note: string | null;
  unitNav?: number | null;
  totalAssets?: number | null;
  cash?: number | null;
  liabilities?: number | null;
  valuationStatus?: string;
  priceCoveragePct?: number | null;
}
export interface Holding {
  id: string;
  symbol: string;
  companyName: string;
  sector: string;
  quantity: number;
  avgCost: number;
  entryDate: string;
  status: "active" | "exited";
  exitDate: string | null;
  exitPrice: number | null;
  buyCash: number;
  sellCash: number;
}
export interface Decision {
  id: string;
  date: string;
  sector: string;
  companyName: string | null;
  symbol: string | null;
  decision: "BUY" | "HOLD" | "SELL";
  rationale: string;
  voteCount: string | null;
  caseId?: string | null;
  status?: string;
  meetingReference?: string | null;
  quorum?: number | null;
  votesFor?: number | null;
  votesAgainst?: number | null;
  abstentions?: number | null;
  proposedWeight?: number | null;
  riskNotes?: string | null;
  thesisBreakers?: string | null;
  approvedAt?: string | null;
}
export interface Transaction {
  id: string;
  symbol: string;
  companyName: string;
  sector: string;
  transactionType: "BUY" | "SELL";
  tradeDate: string;
  settlementDate: string | null;
  quantity: number;
  price: number;
  grossAmount: number;
  fees: number;
  taxes: number;
  decisionId: string | null;
  status: string;
  reference: string | null;
  notes: string | null;
}
export interface InvestmentCase {
  id: string;
  symbol: string;
  companyName: string;
  sectorCode: string;
  status: string;
  thesis: string;
  keyRisks: string | null;
  thesisBreakers: string | null;
  valuationMethod: string | null;
  bearCase: string | null;
  baseCase: string | null;
  bullCase: string | null;
  bearValue: number | null;
  baseValue: number | null;
  bullValue: number | null;
  proposedWeight: number | null;
  sourceReportId: string | null;
}
export interface IndustryContentEntry {
  sectorSlug: string;
  layer: string;
  title: string;
  content: string;
  updatedAt: string;
}

export async function listNavHistory(): Promise<NavEntry[]> {
  const { data, error } = await supabase.from("nav_history").select("*").order("date", { ascending: true });
  if (error) throw new Error(`Failed to list NAV history: ${error.message}`);
  return (data ?? []).map((r) => ({
    id: r.id,
    date: r.date,
    nav: Number(r.nav),
    note: r.note,
    unitNav: r.unit_nav == null ? null : Number(r.unit_nav),
    totalAssets: r.total_assets == null ? null : Number(r.total_assets),
    cash: r.cash == null ? null : Number(r.cash),
    liabilities: r.liabilities == null ? null : Number(r.liabilities),
    valuationStatus: r.valuation_status,
    priceCoveragePct: r.price_coverage_pct == null ? null : Number(r.price_coverage_pct),
  }));
}

export async function addNavEntry(input: {
  date: string; nav: number; note?: string; unitNav?: number; totalAssets?: number;
  cash?: number; liabilities?: number; valuationStatus?: string; priceCoveragePct?: number;
}): Promise<NavEntry> {
  const row = {
    id: randomUUID(), date: input.date, nav: input.nav, note: input.note ?? null,
    unit_nav: input.unitNav ?? null, total_assets: input.totalAssets ?? null,
    cash: input.cash ?? null, liabilities: input.liabilities ?? null,
    valuation_status: input.valuationStatus ?? "UNVERIFIED",
    price_coverage_pct: input.priceCoveragePct ?? null,
  };
  const { data, error } = await supabase.from("nav_history").upsert(row, { onConflict: "date" }).select().single();
  if (error) throw new Error(`Failed to save NAV entry: ${error.message}`);
  return {
    id: data.id, date: data.date, nav: Number(data.nav), note: data.note,
    unitNav: data.unit_nav == null ? null : Number(data.unit_nav),
    totalAssets: data.total_assets == null ? null : Number(data.total_assets),
    cash: data.cash == null ? null : Number(data.cash),
    liabilities: data.liabilities == null ? null : Number(data.liabilities),
    valuationStatus: data.valuation_status,
    priceCoveragePct: data.price_coverage_pct == null ? null : Number(data.price_coverage_pct),
  };
}

export async function listTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase.from("transactions").select("*")
    .eq("status", "POSTED").order("trade_date", { ascending: false }).order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to list transactions: ${error.message}`);
  return (data ?? []).map((r) => ({
    id: r.id, symbol: r.symbol, companyName: r.company_name, sector: r.sector_code,
    transactionType: r.transaction_type, tradeDate: r.trade_date, settlementDate: r.settlement_date,
    quantity: Number(r.quantity), price: Number(r.price), grossAmount: Number(r.gross_amount),
    fees: Number(r.fees), taxes: Number(r.taxes), decisionId: r.decision_id, status: r.status,
    reference: r.reference, notes: r.notes,
  }));
}

export async function listHoldings(): Promise<Holding[]> {
  const transactions = await listTransactions();
  type Group = {
    symbol: string; companyName: string; sector: string; buyQty: number; sellQty: number;
    buyCash: number; sellCash: number; firstBuy: string; lastSell: string | null; lastSellPrice: number | null;
  };
  const groups = new Map<string, Group>();
  for (const t of transactions) {
    const key = t.symbol.toUpperCase();
    const existing = groups.get(key) ?? {
      symbol: t.symbol, companyName: t.companyName, sector: t.sector,
      buyQty: 0, sellQty: 0, buyCash: 0, sellCash: 0,
      firstBuy: t.tradeDate, lastSell: null, lastSellPrice: null,
    };
    if (t.transactionType === "BUY") {
      existing.buyQty += t.quantity;
      existing.buyCash += t.grossAmount + t.fees + t.taxes;
      existing.firstBuy = existing.firstBuy < t.tradeDate ? existing.firstBuy : t.tradeDate;
    } else {
      existing.sellQty += t.quantity;
      existing.sellCash += t.grossAmount - t.fees - t.taxes;
      existing.lastSell = t.tradeDate;
      existing.lastSellPrice = t.price;
    }
    groups.set(key, existing);
  }
  return Array.from(groups.values()).map((g) => {
    const quantity = Math.max(0, g.buyQty - g.sellQty);
    const status: "active" | "exited" = quantity > 1e-9 ? "active" : "exited";
    return {
      id: `position-${g.symbol}`, symbol: g.symbol, companyName: g.companyName, sector: g.sector,
      quantity, avgCost: g.buyQty > 0 ? g.buyCash / g.buyQty : 0, entryDate: g.firstBuy,
      status, exitDate: status === "exited" ? g.lastSell : null,
      exitPrice: status === "exited" ? g.lastSellPrice : null,
      buyCash: g.buyCash, sellCash: g.sellCash,
    };
  });
}

export async function postTransaction(input: {
  symbol: string; companyName: string; sector: string; transactionType: "BUY" | "SELL";
  tradeDate: string; quantity: number; price: number; fees?: number; taxes?: number;
  decisionId: string; notes?: string;
}): Promise<Transaction> {
  const { data, error } = await supabase.rpc("record_trade", {
    p_symbol: input.symbol,
    p_company_name: input.companyName,
    p_sector: input.sector,
    p_transaction_type: input.transactionType,
    p_trade_date: input.tradeDate,
    p_quantity: input.quantity,
    p_price: input.price,
    p_fees: input.fees ?? 0,
    p_taxes: input.taxes ?? 0,
    p_decision_id: input.decisionId,
    p_notes: input.notes ?? null,
  });
  if (error) throw new Error(error.message);
  const transaction = (await listTransactions()).find((x) => x.id === data);
  if (!transaction) throw new Error("Trade was posted but could not be reloaded.");
  return transaction;
}

export async function addHolding(
  input: Omit<Holding, "id" | "status" | "exitDate" | "exitPrice" | "buyCash" | "sellCash"> & { decisionId: string }
): Promise<Holding> {
  await postTransaction({
    symbol: input.symbol, companyName: input.companyName, sector: input.sector,
    transactionType: "BUY", tradeDate: input.entryDate, quantity: input.quantity,
    price: input.avgCost, decisionId: input.decisionId, notes: "Opening portfolio position.",
  });
  const holding = (await listHoldings()).find((x) => x.symbol === input.symbol && x.status === "active");
  if (!holding) throw new Error("Position was posted but could not be derived.");
  return holding;
}

export async function exitHolding(
  id: string, exitDate: string, exitPrice: number, decisionId: string, quantity?: number
): Promise<boolean> {
  const holding = (await listHoldings()).find((x) => x.id === id || x.symbol === id);
  if (!holding || holding.status !== "active") return false;
  const sellQuantity = quantity ?? holding.quantity;
  if (sellQuantity <= 0 || sellQuantity > holding.quantity + 1e-9) throw new Error("Sell quantity exceeds the current position.");
  await postTransaction({
    symbol: holding.symbol, companyName: holding.companyName, sector: holding.sector,
    transactionType: "SELL", tradeDate: exitDate, quantity: sellQuantity, price: exitPrice,
    decisionId, notes: sellQuantity < holding.quantity ? "Partial exit." : "Full exit.",
  });
  return true;
}

export async function deleteHolding(_id: string): Promise<void> {
  throw new Error("Holdings are derived from the immutable transaction ledger and cannot be deleted.");
}

export async function listDecisions(): Promise<Decision[]> {
  const { data, error } = await supabase.from("decisions").select("*")
    .order("date", { ascending: false }).order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to list decisions: ${error.message}`);
  return (data ?? []).map((r) => ({
    id: r.id, date: r.date, sector: r.sector, companyName: r.company_name, symbol: r.symbol,
    decision: r.decision as "BUY" | "HOLD" | "SELL", rationale: r.rationale, voteCount: r.vote_count,
    caseId: r.case_id, status: r.status, meetingReference: r.meeting_reference, quorum: r.quorum,
    votesFor: r.votes_for, votesAgainst: r.votes_against, abstentions: r.abstentions,
    proposedWeight: r.proposed_weight, riskNotes: r.risk_notes, thesisBreakers: r.thesis_breakers,
    approvedAt: r.approved_at,
  }));
}

export async function addDecision(input: Omit<Decision, "id">): Promise<Decision> {
  const row = {
    id: randomUUID(), date: input.date, sector: input.sector, company_name: input.companyName,
    symbol: input.symbol, decision: input.decision, rationale: input.rationale, vote_count: input.voteCount,
    case_id: input.caseId ?? null, status: input.status ?? "DRAFT", meeting_reference: input.meetingReference ?? null,
    quorum: input.quorum ?? null, votes_for: input.votesFor ?? null, votes_against: input.votesAgainst ?? null,
    abstentions: input.abstentions ?? null, proposed_weight: input.proposedWeight ?? null,
    risk_notes: input.riskNotes ?? null, thesis_breakers: input.thesisBreakers ?? null, approved_at: input.approvedAt ?? null,
  };
  const { data, error } = await supabase.from("decisions").insert(row).select().single();
  if (error) throw new Error(`Failed to save decision: ${error.message}`);
  await supabase.from("audit_events").insert({ action: "CREATE", entity_type: "decision", entity_id: data.id, after_data: data });
  return (await listDecisions()).find((x) => x.id === data.id)!;
}

export async function deleteDecision(_id: string): Promise<void> {
  throw new Error("Decision register entries are immutable. Amend or supersede a decision instead of deleting it.");
}

export async function listInvestmentCases(): Promise<InvestmentCase[]> {
  const { data, error } = await supabase.from("investment_cases").select("*").order("updated_at", { ascending: false });
  if (error) throw new Error(`Failed to list investment cases: ${error.message}`);
  return (data ?? []).map((r) => ({
    id: r.id, symbol: r.symbol, companyName: r.company_name, sectorCode: r.sector_code, status: r.status,
    thesis: r.thesis, keyRisks: r.key_risks, thesisBreakers: r.thesis_breakers, valuationMethod: r.valuation_method,
    bearCase: r.bear_case, baseCase: r.base_case, bullCase: r.bull_case,
    bearValue: r.bear_value == null ? null : Number(r.bear_value),
    baseValue: r.base_value == null ? null : Number(r.base_value),
    bullValue: r.bull_value == null ? null : Number(r.bull_value),
    proposedWeight: r.proposed_weight == null ? null : Number(r.proposed_weight),
    sourceReportId: r.source_report_id,
  }));
}

export async function addInvestmentCase(input: Omit<InvestmentCase, "id">): Promise<InvestmentCase> {
  const row = {
    id: randomUUID(), symbol: input.symbol, company_name: input.companyName, sector_code: input.sectorCode,
    status: input.status, thesis: input.thesis, key_risks: input.keyRisks, thesis_breakers: input.thesisBreakers,
    valuation_method: input.valuationMethod, bear_case: input.bearCase, base_case: input.baseCase, bull_case: input.bullCase,
    bear_value: input.bearValue, base_value: input.baseValue, bull_value: input.bullValue,
    proposed_weight: input.proposedWeight, source_report_id: input.sourceReportId,
  };
  const { data, error } = await supabase.from("investment_cases").insert(row).select().single();
  if (error) throw new Error(`Failed to create investment case: ${error.message}`);
  await supabase.from("audit_events").insert({ action: "CREATE", entity_type: "investment_case", entity_id: data.id, after_data: data });
  return (await listInvestmentCases()).find((x) => x.id === data.id)!;
}

function mapIndustryContent(row: { sector_slug: string; layer: string; title: string; content: string; updated_at: string }): IndustryContentEntry {
  return { sectorSlug: row.sector_slug, layer: row.layer, title: row.title, content: row.content, updatedAt: row.updated_at };
}
export async function listIndustryContent(sectorSlug: string): Promise<IndustryContentEntry[]> {
  const { data, error } = await supabase.from("industry_content").select("*").eq("sector_slug", sectorSlug);
  if (error) throw new Error(`Failed to load industry content: ${error.message}`);
  return (data ?? []).map(mapIndustryContent);
}
export async function listAllIndustryContent(): Promise<IndustryContentEntry[]> {
  const { data, error } = await supabase.from("industry_content").select("*");
  if (error) throw new Error(`Failed to list industry content: ${error.message}`);
  return (data ?? []).map(mapIndustryContent);
}
export async function upsertIndustryContent(input: { sectorSlug: string; layer: string; title: string; content: string }): Promise<IndustryContentEntry> {
  const row = { id: randomUUID(), sector_slug: input.sectorSlug, layer: input.layer, title: input.title, content: input.content, updated_at: new Date().toISOString() };
  const { data, error } = await supabase.from("industry_content").upsert(row, { onConflict: "sector_slug,layer" }).select().single();
  if (error) throw new Error(`Failed to save industry content: ${error.message}`);
  return mapIndustryContent(data);
}
