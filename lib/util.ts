
export function calculatePercentageChange(previous: number, current: number): string {
  if (previous === 0) return current > 0 ? '+100%' : '0%'
  
  const change = ((current - previous) / previous) * 100
  const sign = change >= 0 ? '+' : ''
  return `${sign}${Math.round(change)}%`
}

