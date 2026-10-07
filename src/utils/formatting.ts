export function formatNumber(val: number, decimals: number = 0): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}

export function formatMetricValue(value: number, metricKey: string): string {
  switch (metricKey.toLowerCase()) {
    case 'temperature':
    case 'temp':
      return `${formatNumber(value, 1)} °C`;
    case 'vibration':
    case 'vib':
      return `${formatNumber(value, 2)} mm/s`;
    case 'rpm':
      return `${formatNumber(value, 0)} RPM`;
    case 'current':
      return `${formatNumber(value, 1)} A`;
    case 'utilization':
    case 'oee':
    case 'availability':
    case 'performance':
    case 'quality':
      return `${formatNumber(value, 1)}%`;
    case 'production':
      return `${formatNumber(value, 0)} u/h`;
    case 'downtime':
      return `${formatNumber(value, 1)} hrs`;
    default:
      return formatNumber(value, 1);
  }
}

export function formatTimeAgo(timestampStr: string): string {
  const date = new Date(timestampStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatTimestamp(timestampStr: string): string {
  const date = new Date(timestampStr);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function formatDateShort(timestampStr: string): string {
  const date = new Date(timestampStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
