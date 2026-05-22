import React from 'react';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';

interface Props {
  icon: React.ReactNode;
  label: string;
  numericValue?: number;
  suffix?: string;
  value?: string;
  sub?: string;
  color?: string;
  delay?: number;
  decimals?: number;
}

export const StatCard: React.FC<Props> = ({
  icon, label, numericValue, suffix = '', value, sub, color, delay = 0, decimals = 0
}) => {
  const animated = useAnimatedNumber(numericValue ?? 0);
  const display = numericValue !== undefined
    ? `${decimals > 0 ? animated.toFixed(decimals) : Math.round(animated)}${suffix}`
    : (value ?? '');

  return (
    <div className="stat-card" style={{ '--delay': `${delay}ms`, '--color': color || '#60a5fa' } as React.CSSProperties}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{display}</span>
        {sub && <span className="stat-sub">{sub}</span>}
      </div>
    </div>
  );
};
