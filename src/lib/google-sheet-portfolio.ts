import { listHoldings, listDecisions, type Holding, type Decision } from "./portfolio-db";

/**
 * Legacy compatibility wrapper.
 * Production NEEV portfolio data is controlled by Supabase.
 * Google Sheets are retained as optional offline/import templates and are never
 * allowed to silently override the book of record.
 */
export async function getHoldings(): Promise<Holding[]> { return listHoldings(); }
export async function getDecisions(): Promise<Decision[]> { return listDecisions(); }
