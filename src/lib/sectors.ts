export interface Sector {
  slug: string;
  name: string;
}

export const SECTORS: Sector[] = [
  { slug: "banking-financial-services", name: "Banking & Financial Services" },
  { slug: "automobile", name: "Automobile" },
  { slug: "energy-infrastructure", name: "Energy & Infrastructure" },
  { slug: "fmcg", name: "FMCG" },
  { slug: "pharmaceuticals", name: "Pharmaceuticals" },
];

export function getSector(slug: string): Sector | undefined {
  return SECTORS.find((s) => s.slug === slug);
}

export interface Layer {
  key: string;
  label: string;
  question: string;
}

export const LAYERS: Layer[] = [
  { key: "overview", label: "Overview", question: "Should we invest in this industry?" },
  { key: "valueChain", label: "Value Chain", question: "Where in the value chain should we invest?" },
  { key: "businessModel", label: "Business Model", question: "Which business model deserves our capital?" },
  { key: "financialDashboard", label: "Financial Dashboard", question: "Which companies generate superior returns?" },
  { key: "valuationDashboard", label: "Valuation Dashboard", question: "Which companies are undervalued today?" },
  { key: "governanceEsg", label: "Governance & ESG", question: "Can management be trusted with capital?" },
  { key: "growthRisk", label: "Growth & Risk", question: "What will drive returns over 3-5 years?" },
  { key: "annualReview", label: "Annual Review", question: "Did our process outperform the market?" },
];

export function getLayer(key: string): Layer | undefined {
  return LAYERS.find((l) => l.key === key);
}

export const REPORT_SECTOR_OPTIONS = SECTORS.map((s) => s.name);

export const FUND_CONFIG = {
  fundName: "NEEV",
  fundLongName: "New-age Equity Evaluation & Valuation",
  sponsorName: "Finception",
  institutionName: "Great Lakes Institute of Management, Gurgaon",
  notionalAum: 1_000_000,
  currency: "INR",
  benchmarkName: "Nifty 500 TRI",
  benchmarkSymbol: null as string | null,
  cycleLabel: "Perpetual",
  maxInitialPositionWeight: 0.08,
  maxSingleStockWeight: 0.1,
  maxSingleSectorWeight: 0.3,
  minCashBuffer: 0,
  maxCashBuffer: 0.05,
  minNamesAtFullDeployment: 15,
  maxNamesAtFullDeployment: 25,
  horizonLabel: "3–5 years",
};
