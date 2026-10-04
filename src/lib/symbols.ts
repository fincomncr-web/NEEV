export interface CompanyOption {
  symbol: string;
  name: string;
}

export const POPULAR_COMPANIES: CompanyOption[] = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries" },
  { symbol: "TCS.NS", name: "Tata Consultancy Services" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank" },
  { symbol: "INFY.NS", name: "Infosys" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank" },
  { symbol: "SBIN.NS", name: "State Bank of India" },
  { symbol: "ITC.NS", name: "ITC" },
  { symbol: "LT.NS", name: "Larsen & Toubro" },
  { symbol: "BAJFINANCE.NS", name: "Bajaj Finance" },
  { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever" },
  { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank" },
  { symbol: "MARUTI.NS", name: "Maruti Suzuki" },
  { symbol: "ADANIENT.NS", name: "Adani Enterprises" },
  { symbol: "WIPRO.NS", name: "Wipro" },
  { symbol: "SUNPHARMA.NS", name: "Sun Pharma" },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors" },
];

export const INDEX_SYMBOLS: CompanyOption[] = [
  { symbol: "^NSEI", name: "NIFTY 50" },
  { symbol: "^BSESN", name: "SENSEX" },
  { symbol: "^NSEBANK", name: "BANK NIFTY" },
];

export const TICKER_SYMBOLS: CompanyOption[] = [
  { symbol: "^NSEI", name: "NIFTY 50" },
  { symbol: "^BSESN", name: "SENSEX" },
  { symbol: "RELIANCE.NS", name: "Reliance" },
  { symbol: "TCS.NS", name: "TCS" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank" },
  { symbol: "INFY.NS", name: "Infosys" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank" },
  { symbol: "SBIN.NS", name: "SBI" },
];
