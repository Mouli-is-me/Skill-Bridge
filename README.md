# SKILL BRIDGE - Industrial Machine Monitoring & Performance Intelligence Platform

SKILL BRIDGE is a desktop-first, industrial-grade operations platform for real-time fleet machine monitoring, multi-asset comparison, event auditing, and performance intelligence analytics.

Built with **React 18**, **TypeScript**, **Vite**, **Zustand**, **Recharts**, and **Tailwind CSS**.

---

## Features & Highlights

- **Factory Overview Dashboard (`/dashboard`)**:
  - 5 Operational KPI cards with metric-aware contextual deltas (Availability, Utilization, Production Rate, Downtime Hours, OEE).
  - Horizontal fleet breakdown strip (RUNNING, WARNING, ERROR, IDLE counts).
  - 12-Machine grid displaying real-time sensor metrics (RPM, Temperature °C, Vibration mm/s, Utilization %).
  - Interactive Production Performance timeseries chart with metric and timeframe selectors (1H, 6H, 12H, 24H, 7D).
  - Live Recent Events list with interactive inspection drawer.

- **Machine Fleet Directory (`/machines`)**:
  - Global search by ID, name, location, model.
  - Multi-select filters (Status, Asset Type) and Dense Table vs. Grid view toggle.

- **Machine Detail Intelligence (`/machines/:machineId`)**:
  - Designed hero story for **M-03 (Rapier Loom B1)**.
  - Real-time metric strip with metric-aware directional deltas.
  - 2D Flat Technical Sub-System Schematic (Drive Motor, Main Bearing, Warp Feed, Dampeners).
  - Live Sensor Data stream with metric switcher and min/max/avg statistics.
  - Shift-over-Shift Performance Comparison matrix (Current Shift vs. Previous Shift vs. Delta).
  - Historical performance overlay (Today / Yesterday / 7D / 30D).
  - Machine Event Timeline with slide-over detail viewer.

- **Performance Comparison (`/compare`)**:
  - Multi-machine selection (up to 4 assets side-by-side).
  - Dual modes: Asset-vs-Asset and Period-vs-Period overlay.
  - Comparative metric matrix and overlay timeseries charts.

- **System Event Audit Log (`/events`)**:
  - Searchable audit log with Machine, Severity (ERROR, WARNING, INFO), and Event Type filters.
  - Export audit log to CSV.
  - Slide-over detail drawer showing triggering readings vs. threshold limits.

- **OEE & Analytics Intelligence (`/analytics`)**:
  - OEE component breakdown (Availability %, Performance %, Quality Output Yield %).
  - Fleet Utilization bar chart and Downtime Loss distribution.
  - Top Performing Assets vs. Operational Bottlenecks ranking list.

- **Shift & Operational Reports (`/reports`)**:
  - Customizable report generator (Period scope, Asset scope).
  - Interactive live report document preview.
  - Export CSV and Print/PDF report stylesheets.

- **Platform & Threshold Settings (`/settings`)**:
  - **Dynamic Threshold Editor**: Editable warning and critical limits for Temperature and Vibration per machine. *The simulator immediately reads these modified thresholds to trigger events in real time.*
  - **Simulator Controls**: Network outage simulator (LIVE, DEGRADED, CONNECTION LOST), M-03 scenario triggers, 30-day historical data reseed, and full factory reset.
  - **Appearance Theme**: Light Industrial theme (#F5F6F4 default) and Dark Charcoal theme (#121513, never pure black).

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation & Running Locally

1. Clone or navigate to the repository directory:
   ```bash
   cd "d:/Personal/Skill Bridge/Skill Bridge"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

---

## System Architecture & Backend Integration Guide

```
src/
├── components/
│   ├── layout/       # Sidebar, TopBar, MobileNav, AppLayout shell
│   ├── dashboard/    # KPIOverview, MachineStatusSummary, MachineGrid, ProductionChart, RecentEvents
│   ├── machines/     # MachineTable, TechnicalSchematic, SensorChart, PerformanceComparison, Timeline
│   ├── compare/      # ComparisonSelector, ComparisonTable, ComparisonChart
│   ├── events/       # EventFilters, EventTable, EventDetailDrawer
│   ├── analytics/    # KPIGrid, UtilizationChart, DowntimeChart, PerformanceRanking
│   ├── reports/      # ReportBuilder, ReportPreview
│   ├── settings/     # ThresholdSettings, SimulatorSettings, AppearanceSettings
│   └── ui/           # Button, Badge, Card, Select, Modal, Drawer, Skeleton, DeltaBadge, Tabs
├── services/
│   ├── api.ts                  # REST API abstraction layer
│   ├── websocket.ts            # Simulated WebSocket stream subscriber
│   ├── simulationEngine.ts     # Real-time metric ticker (1.5s interval)
│   ├── thresholdEngine.ts      # Dynamic threshold checking engine
│   └── historicalDataGenerator.ts # 30-day seeded telemetry generator
├── store/
│   ├── machineStore.ts    # Machines, events, and historical timeseries state
│   ├── simulationStore.ts # Connection status and M-03 scenario state
│   └── uiStore.ts         # Theme, drawer state, search query
└── utils/
    ├── calculations.ts    # Metric-aware contextual deltas & OEE
    ├── formatting.ts      # Unit & timestamp formatting
    ├── csvExport.ts       # CSV download helper
    └── pdfExport.ts       # Print PDF helper
```

### Swapping the Simulator for a Real Backend

The platform is designed with a strict service-layer isolation (`src/services/api.ts` and `src/services/websocket.ts`).

1. **REST API Integration**:
   Replace the functions in `src/services/api.ts` with fetch/axios calls pointing to your real REST API endpoints (e.g. `/api/v1/machines`, `/api/v1/events`, `/api/v1/kpis`).

2. **Real-time Telemetry (WebSocket / MQTT)**:
   In `src/services/websocket.ts`, replace the mock EventEmitter with a real WebSocket connection:
   ```typescript
   const socket = new WebSocket('wss://your-industrial-iot-server.com/stream');
   socket.onmessage = (event) => {
     const telemetryPayload = JSON.parse(event.data);
     useMachineStore.getState().updateMachineMetrics(telemetryPayload.machineId, telemetryPayload.metrics);
   };
   ```

3. **Disabling the Client Simulator**:
   To stop the client-side simulator when connected to a live backend, simply omit `startSimulationEngine()` in `AppLayout.tsx`.
