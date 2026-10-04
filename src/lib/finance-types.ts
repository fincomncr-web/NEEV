export interface QuoteData {
  symbol:string; name:string; price:number|null; previousClose:number|null; change:number|null; changePercent:number|null;
  dayHigh:number|null; dayLow:number|null; open:number|null; volume:number|null; marketCap:number|null;
  fiftyTwoWeekHigh:number|null; fiftyTwoWeekLow:number|null; currency:string|null; marketState:string|null;
  asOf:string|null;
}
export interface CandlePoint{time:string;open:number;high:number;low:number;close:number;volume:number;}
export interface CompanyProfile{sector:string|null;industry:string|null;description:string|null;website:string|null;employees:number|null;city:string|null;country:string|null;}
export interface FinancialHighlights{marketCap:number|null;peRatio:number|null;forwardPE:number|null;eps:number|null;dividendYield:number|null;profitMargin:number|null;revenue:number|null;revenueGrowth:number|null;returnOnEquity:number|null;debtToEquity:number|null;beta:number|null;}
export interface SearchResult{symbol:string;name:string;exchange:string;type:string;}
