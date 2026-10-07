export interface KpiOverview {
  totalMachines: number;
  runningCount: number;
  warningCount: number;
  errorCount: number;
  idleCount: number;
  
  utilizationRate: number;      // %
  utilizationDelta: number;     // % change vs yesterday
  
  totalProduction: number;      // units (meters/kg)
  productionDelta: number;      // % change vs yesterday
  
  downtimeHours: number;        // total hours
  downtimeDelta: number;        // % change vs yesterday
  
  oee: number;                  // Overall Equipment Effectiveness %
  oeeDelta: number;             // % change
  
  availability: number;         // %
  performance: number;          // %
  quality: number;              // %
}

export interface MetricDelta {
  value: number;                // current value
  previousValue: number;        // previous value
  percentageChange: number;     // calculated % change
  direction: 'up' | 'down' | 'neutral';
  isGood: boolean;              // depends on metric context!
}
