export interface PerformanceStats {
  totalReturnPct: number | null;
  annualizedReturnPct: number | null;
  annualizedVolatilityPct: number | null;
  maxDrawdownPct: number | null;
  observations: number;
  frequency: "daily" | "weekly" | "monthly" | "irregular" | null;
}

function frequencyOf(values:{date:string;value:number}[]): PerformanceStats["frequency"] {
  if (values.length < 3) return null;
  const gaps = values.slice(1).map((x,i)=>(new Date(x.date).getTime()-new Date(values[i].date).getTime())/86400000);
  const median=[...gaps].sort((a,b)=>a-b)[Math.floor(gaps.length/2)];
  if (median <= 2) return "daily";
  if (median <= 10) return "weekly";
  if (median <= 40) return "monthly";
  return "irregular";
}

export function computePerformanceStats(values:{date:string;value:number}[]):PerformanceStats{
  const clean=values.filter(x=>Number.isFinite(x.value)&&x.value>0).sort((a,b)=>a.date.localeCompare(b.date));
  if(clean.length<2)return{totalReturnPct:null,annualizedReturnPct:null,annualizedVolatilityPct:null,maxDrawdownPct:null,observations:clean.length,frequency:frequencyOf(clean)};
  const first=clean[0],last=clean[clean.length-1];
  const totalReturnPct=(last.value/first.value-1)*100;
  const days=Math.max(1,(new Date(last.date).getTime()-new Date(first.date).getTime())/86400000);
  const years=days/365.25;
  const annualizedReturnPct=years>=0.25?(Math.pow(last.value/first.value,1/years)-1)*100:null;
  const frequency=frequencyOf(clean);
  const returns:number[]=[];
  for(let i=1;i<clean.length;i++) returns.push(clean[i].value/clean[i-1].value-1);
  const mean=returns.reduce((s,r)=>s+r,0)/returns.length;
  const variance=returns.length>1?returns.reduce((s,r)=>s+(r-mean)**2,0)/(returns.length-1):0;
  const periodsPerYear=frequency==="daily"?252:frequency==="weekly"?52:frequency==="monthly"?12:null;
  const annualizedVolatilityPct=periodsPerYear?Math.sqrt(variance)*Math.sqrt(periodsPerYear)*100:null;
  let peak=clean[0].value,maxDrawdown=0;
  for(const point of clean){peak=Math.max(peak,point.value);maxDrawdown=Math.min(maxDrawdown,point.value/peak-1);}
  return{totalReturnPct,annualizedReturnPct,annualizedVolatilityPct,maxDrawdownPct:maxDrawdown*100,observations:clean.length,frequency};
}
export function indexTo100(values:{date:string;value:number}[]){const clean=values.filter(x=>Number.isFinite(x.value)&&x.value>0).sort((a,b)=>a.date.localeCompare(b.date));if(!clean.length)return[];const base=clean[0].value;return clean.map(x=>({date:x.date,value:x.value/base*100}));}
