export function sma(values: number[], period: number): number | null {
  if (values.length < period) return null;
  const slice = values.slice(values.length - period);
  return slice.reduce((sum, v) => sum + v, 0) / period;
}

function emaSeries(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const k = 2 / (period + 1);
  const result: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    result.push(values[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

export function ema(values: number[], period: number): number | null {
  if (values.length < period) return null;
  const series = emaSeries(values, period);
  return series[series.length - 1];
}

export function rsi(values: number[], period = 14): number | null {
  if (values.length < period + 1) return null;

  let gains = 0;
  let losses = 0;
  for (let i = values.length - period; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export interface MacdResult {
  macd: number;
  signal: number;
  histogram: number;
}

export function macd(
  values: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): MacdResult | null {
  if (values.length < slowPeriod + signalPeriod) return null;

  const fastSeries = emaSeries(values, fastPeriod);
  const slowSeries = emaSeries(values, slowPeriod);
  const macdSeries = fastSeries.map((v, i) => v - slowSeries[i]);
  const signalSeries = emaSeries(macdSeries, signalPeriod);

  const macdValue = macdSeries[macdSeries.length - 1];
  const signalValue = signalSeries[signalSeries.length - 1];
  return { macd: macdValue, signal: signalValue, histogram: macdValue - signalValue };
}

export type Rating = "Strong Sell" | "Sell" | "Neutral" | "Buy" | "Strong Buy";

export interface TechnicalSummary {
  price: number;
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  rsi14: number | null;
  macd: MacdResult | null;
  rating: Rating;
  bullishSignals: number;
  bearishSignals: number;
  totalSignals: number;
}

export function computeTechnicalSummary(closes: number[]): TechnicalSummary {
  const price = closes[closes.length - 1];
  const sma20Value = sma(closes, 20);
  const sma50Value = sma(closes, 50);
  const sma200Value = sma(closes, 200);
  const rsiValue = rsi(closes, 14);
  const macdValue = macd(closes);

  let bullish = 0;
  let bearish = 0;
  let total = 0;

  if (sma20Value !== null) {
    total++;
    if (price > sma20Value) bullish++;
    else bearish++;
  }
  if (sma50Value !== null) {
    total++;
    if (price > sma50Value) bullish++;
    else bearish++;
  }
  if (sma200Value !== null) {
    total++;
    if (price > sma200Value) bullish++;
    else bearish++;
  }
  if (rsiValue !== null) {
    total++;
    if (rsiValue < 30) bullish++;
    else if (rsiValue > 70) bearish++;
  }
  if (macdValue !== null) {
    total++;
    if (macdValue.histogram > 0) bullish++;
    else bearish++;
  }

  const score = total === 0 ? 0 : (bullish - bearish) / total;
  let rating: Rating = "Neutral";
  if (score >= 0.6) rating = "Strong Buy";
  else if (score >= 0.2) rating = "Buy";
  else if (score <= -0.6) rating = "Strong Sell";
  else if (score <= -0.2) rating = "Sell";

  return {
    price,
    sma20: sma20Value,
    sma50: sma50Value,
    sma200: sma200Value,
    rsi14: rsiValue,
    macd: macdValue,
    rating,
    bullishSignals: bullish,
    bearishSignals: bearish,
    totalSignals: total,
  };
}
