import { Machine, HistoricalMachineData, MetricTimeSeriesPoint } from '../types/machine';

// Generates 30 days of historical data for each machine
export function generate30DayHistory(machines: Machine[]): Record<string, HistoricalMachineData> {
  const historyMap: Record<string, HistoricalMachineData> = {};
  const now = new Date();
  const millisecondsInHour = 3600 * 1000;
  const totalHours = 30 * 24; // 720 hours

  machines.forEach(machine => {
    const hourlyPoints: MetricTimeSeriesPoint[] = [];
    const dailyMap: Record<string, { prod: number; utilSum: number; oeeSum: number; downMins: number; count: number }> = {};

    let currentTemp = machine.metrics.temperature - (Math.random() * 5);
    let currentVib = machine.metrics.vibration - (Math.random() * 0.5);
    let currentRpm = machine.metrics.rpm;
    let currentUtil = machine.metrics.utilization;

    for (let h = totalHours; h >= 0; h--) {
      const pointTime = new Date(now.getTime() - h * millisecondsInHour);
      const isoStr = pointTime.toISOString();
      const dateKey = isoStr.slice(0, 10);

      // Add realistic cyclic variations (shift patterns, night vs day)
      const hourOfDay = pointTime.getHours();
      const shiftFactor = (hourOfDay >= 6 && hourOfDay <= 22) ? 1.0 : 0.92;
      const noise = (Math.random() - 0.5) * 0.05;

      // Special scenario for M-03 in the past few hours: simulated temporary overheat spike
      let isProblemWindow = machine.id === 'M-03' && h < 6;

      const temp = Math.max(45, Math.min(95, isProblemWindow ? 84 + Math.random() * 4 : currentTemp + (Math.random() - 0.48) * 1.2));
      const vib = Math.max(0.5, Math.min(8.0, isProblemWindow ? 5.8 + Math.random() * 0.8 : currentVib + (Math.random() - 0.48) * 0.2));
      const rpm = isProblemWindow ? currentRpm * 0.6 : Math.round(currentRpm * (0.95 + Math.random() * 0.1) * shiftFactor);
      const util = isProblemWindow ? 45 + Math.random() * 10 : Math.min(99, Math.max(60, currentUtil + (Math.random() - 0.48) * 3));
      const prod = Math.round((rpm / 10) * (util / 100));
      const current = Number(((rpm / 200) + (vib * 0.4) + (Math.random() * 0.5)).toFixed(1));

      hourlyPoints.push({
        timestamp: isoStr,
        timestampRaw: pointTime.getTime(),
        temperature: Number(temp.toFixed(1)),
        vibration: Number(vib.toFixed(2)),
        rpm: Math.round(rpm),
        current,
        production: prod,
        utilization: Number(util.toFixed(1)),
      });

      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { prod: 0, utilSum: 0, oeeSum: 0, downMins: 0, count: 0 };
      }
      dailyMap[dateKey].prod += prod;
      dailyMap[dateKey].utilSum += util;
      dailyMap[dateKey].oeeSum += (util * 0.95);
      if (util < 70) {
        dailyMap[dateKey].downMins += Math.round((70 - util) * 0.6);
      }
      dailyMap[dateKey].count += 1;
    }

    const dailySummary = Object.keys(dailyMap).map(date => {
      const item = dailyMap[date];
      return {
        date,
        totalProduction: Math.round(item.prod),
        avgUtilization: Number((item.utilSum / item.count).toFixed(1)),
        totalDowntimeMinutes: item.downMins,
        avgOee: Number((item.oeeSum / item.count).toFixed(1)),
      };
    }).sort((a, b) => a.date.localeCompare(b.date));

    historyMap[machine.id] = {
      machineId: machine.id,
      hourlyPoints,
      dailySummary,
    };
  });

  return historyMap;
}
