import type { Holding } from "./portfolio-db";
import type { QuoteData } from "./finance-types";
import { FUND_CONFIG } from "./sectors";

function quoteFor(symbol:string,quotes:QuoteData[]){return quotes.find(x=>x.symbol===symbol);}
function canonicalSector(sector:string){const s=sector.trim().toLowerCase();if(s.includes("bank")||s.includes("financial"))return "Banking & Financial Services";if(s.includes("auto"))return "Automobile";if(s.includes("energy")||s.includes("infra"))return "Energy & Infrastructure";if(s==="fmcg")return "FMCG";if(s.includes("pharma"))return "Pharmaceuticals";return sector.trim()||"Unclassified";}

export function computeFundValue(holdings:Holding[],quotes:QuoteData[]):number{
  const active=aggregateActive(holdings,quotes);
  const buyCash=holdings.reduce((s,h)=>s+h.buyCash,0);
  const sellCash=holdings.reduce((s,h)=>s+h.sellCash,0);
  const cash=FUND_CONFIG.notionalAum-buyCash+sellCash;
  return cash+active.reduce((s,h)=>s+h.marketValue,0);
}

interface AggregateRow { symbol:string; companyName:string; sector:string; quantity:number; avgCost:number; marketValue:number; quoteAvailable:boolean; }
function aggregateActive(holdings:Holding[],quotes:QuoteData[]):AggregateRow[]{
  const map=new Map<string,{symbol:string;companyName:string;sector:string;quantity:number;cost:number}>();
  for(const h of holdings.filter(x=>x.status==="active")){
    const key=h.symbol.toUpperCase();
    const prev=map.get(key)??{symbol:h.symbol,companyName:h.companyName,sector:canonicalSector(h.sector),quantity:0,cost:0};
    prev.quantity+=h.quantity; prev.cost+=h.avgCost*h.quantity; map.set(key,prev);
  }
  return [...map.values()].map(x=>{const q=quoteFor(x.symbol,quotes);const price=q?.price??null;return{...x,avgCost:x.quantity?x.cost/x.quantity:0,marketValue:price!==null?price*x.quantity:x.cost,quoteAvailable:price!==null};});
}

export interface HoldingWithLive extends Holding{ltp:number|null;currentValue:number;costValue:number;pnlPct:number|null;quoteAvailable:boolean;priceAsOf:string|null;valuationBasis:"MARKET"|"COST_FALLBACK";}
export function withLiveMetrics(holdings:Holding[],quotes:QuoteData[]):HoldingWithLive[]{
  return holdings.map(h=>{const q=quoteFor(h.symbol,quotes);const ltp=q?.price??null;const costValue=h.avgCost*h.quantity;return{...h,ltp,currentValue:ltp!==null?ltp*h.quantity:costValue,costValue,pnlPct:ltp!==null&&h.avgCost>0?(ltp/h.avgCost-1)*100:null,quoteAvailable:ltp!==null,priceAsOf:q?.asOf??null,valuationBasis:ltp!==null?"MARKET":"COST_FALLBACK"};});
}
export function totalReturnPct(currentValue:number){return((currentValue-FUND_CONFIG.notionalAum)/FUND_CONFIG.notionalAum)*100;}

export interface FundBreakdown{totalValue:number;cash:number;holdingsValue:number;cashPct:number;activeNames:number;maxSingleStockPct:number;maxSingleStockSymbol:string|null;maxSectorPct:number;maxSector:string|null;bySector:{sector:string;value:number;weightPct:number}[];missingQuoteSymbols:string[];quoteCoveragePct:number;valuationStatus:"COMPLETE"|"INCOMPLETE";}
export function computeFundBreakdown(holdings:Holding[],quotes:QuoteData[]):FundBreakdown{
  const rows=aggregateActive(holdings,quotes);const totalValue=computeFundValue(holdings,quotes);const holdingsValue=rows.reduce((s,h)=>s+h.marketValue,0);const cash=totalValue-holdingsValue;
  const sectorTotals=new Map<string,number>();for(const h of rows)sectorTotals.set(h.sector,(sectorTotals.get(h.sector)??0)+h.marketValue);
  const bySector=[...sectorTotals.entries()].map(([sector,value])=>({sector,value,weightPct:totalValue>0?value/totalValue*100:0})).sort((a,b)=>b.weightPct-a.weightPct);
  const top=rows.reduce<AggregateRow|null>((m,h)=>m===null||h.marketValue>m.marketValue?h:m,null);
  const missing=rows.filter(h=>!h.quoteAvailable).map(h=>h.symbol);
  return{totalValue,cash,holdingsValue,cashPct:totalValue>0?cash/totalValue*100:100,activeNames:rows.length,maxSingleStockPct:totalValue&&top?top.marketValue/totalValue*100:0,maxSingleStockSymbol:top?.symbol??null,maxSectorPct:bySector[0]?.weightPct??0,maxSector:bySector[0]?.sector??null,bySector,missingQuoteSymbols:missing,quoteCoveragePct:rows.length?((rows.length-missing.length)/rows.length)*100:100,valuationStatus:missing.length?"INCOMPLETE":"COMPLETE"};
}
export interface CharterStatus{holdings:{current:number;min:number;max:number;status:"within"|"below"|"above"|"pre_deployment"};initialPosition:{limitPct:number};singleStock:{currentPct:number;limitPct:number;status:"within"|"above"};sector:{currentPct:number;limitPct:number;status:"within"|"above"};cash:{currentPct:number;minPct:number;maxPct:number;status:"within"|"below"|"above"|"pre_deployment"};leverage:{cash:number;status:"within"|"breach"};}
export function computeCharterStatus(b:FundBreakdown):CharterStatus{const hs=b.activeNames===0?"pre_deployment":b.activeNames<FUND_CONFIG.minNamesAtFullDeployment?"below":b.activeNames>FUND_CONFIG.maxNamesAtFullDeployment?"above":"within";return{holdings:{current:b.activeNames,min:FUND_CONFIG.minNamesAtFullDeployment,max:FUND_CONFIG.maxNamesAtFullDeployment,status:hs},initialPosition:{limitPct:FUND_CONFIG.maxInitialPositionWeight*100},singleStock:{currentPct:b.maxSingleStockPct,limitPct:FUND_CONFIG.maxSingleStockWeight*100,status:b.maxSingleStockPct>FUND_CONFIG.maxSingleStockWeight*100?"above":"within"},sector:{currentPct:b.maxSectorPct,limitPct:FUND_CONFIG.maxSingleSectorWeight*100,status:b.maxSectorPct>FUND_CONFIG.maxSingleSectorWeight*100?"above":"within"},cash:{currentPct:b.cashPct,minPct:FUND_CONFIG.minCashBuffer*100,maxPct:FUND_CONFIG.maxCashBuffer*100,status:b.activeNames===0?"pre_deployment":b.cashPct<FUND_CONFIG.minCashBuffer*100?"below":b.cashPct>FUND_CONFIG.maxCashBuffer*100?"above":"within"},leverage:{cash:b.cash,status:b.cash<-.01?"breach":"within"}};}
