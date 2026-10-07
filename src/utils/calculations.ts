import { MetricDelta } from '../types/kpi';

export type MetricTypeKey = 
  | 'production' 
  | 'utilization' 
  | 'oee' 
  | 'availability' 
  | 'performance' 
  | 'quality'
  | 'temperature' 
  | 'vibration' 
  | 'downtime' 
  | 'current' 
  | 'rpm';

const HIGHER_IS_BAD_METRICS: Set<string> = new Set([
  'temperature', 
  'temp', 
  'vibration', 
  'vib', 
  'downtime', 
  'current'
]);

export function calculateMetricDelta(
  metricKey: string,
  current: number,
  previous: number
): MetricDelta {
  if (previous === 0 || isNaN(previous) || isNaN(current)) {
    return {
      value: current,
      previousValue: previous,
      percentageChange: 0,
      direction: 'neutral',
      isGood: true,
    };
  }

  const percentageChange = ((current - previous) / previous) * 100;
  const absChange = Math.abs(percentageChange);

  if (absChange < 1.0) {
    return {
      value: current,
      previousValue: previous,
      percentageChange,
      direction: 'neutral',
      isGood: true,
    };
  }

  const isUp = percentageChange > 0;
  const isHigherBad = HIGHER_IS_BAD_METRICS.has(metricKey.toLowerCase());
  
  // If higher is bad (e.g. temp), going UP is BAD, going DOWN is GOOD.
  // If higher is good (e.g. production), going UP is GOOD, going DOWN is BAD.
  const isGood = isHigherBad ? !isUp : isUp;

  return {
    value: current,
    previousValue: previous,
    percentageChange,
    direction: isUp ? 'up' : 'down',
    isGood,
  };
}

export function calculateOEE(
  availability: number,
  performance: number,
  quality: number
): number {
  return (availability * performance * quality) / 10000;
}
