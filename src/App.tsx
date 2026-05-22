import { useEffect, useState, useCallback, useRef } from 'react';
import { useWeather } from './hooks/useWeather';
import { useAnimatedNumber } from './hooks/useAnimatedNumber';
import { useLastUpdated } from './hooks/useLastUpdated';
import { SearchBar } from './components/SearchBar';
import { WeatherIcon } from './components/WeatherIcon';
import { StatCard } from './components/StatCard';
import './App.css';

const MAX_RECENT = 5;

function getTheme(code: number, isDay: boolean): string {
  if (!isDay) return 'night';
  if (code === 1000) return 'sunny';
  if ([1003, 1006].includes(code)) return 'cloudy';
  if ([1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) return 'rainy';
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return 'stormy';
  if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225].includes(code)) return 'snowy';
  if ([1030, 1135, 1147].includes(code)) return 'foggy';
  return 'cloudy';
}

function WindCompass({ degree, dir }: { degree: number; dir: string }) {
  const animDeg = useAnimatedNumber(degree, 1000);
  return (
    <div className="wind-compass">
      <div className="compass-ring">
        <span className="compass-n">N</span>
        <span className="compass-s">S</span>
        <span className="compass-e">E</span>
        <span className="compass-w">W</span>
        <div className="compass-needle" style={{ transform: `rotate(${animDeg}deg)` }} />
      </div>
      <span className="compass-label">{dir}</span>
    </div>
  );
}

function UVBar({ uv }: { uv: number }) {
  const animUV = useAnimatedNumber(uv, 1000);
  const pct = Math.min((animUV / 11) * 100, 100);
  const label = uv <= 2 ? 'Low' : uv <= 5 ? 'Moderate' : uv <= 7 ? 'High' : uv <= 10 ? 'Very High' : 'Extreme';
  return (
    <div className="uv-bar-wrap">
      <div className="uv-bar">
        <div className="uv-thumb" style={{ left: `${pct}%` }} />
      </div>
      <div className="uv-labels">
        <span>{label}</span>
        <span>UV {uv.toFixed(1)}</span>
      </div>
    </div>
  );
}

function CloudRing({ cloud }: { cloud: number }) {
  const animCloud = useAnimatedNumber(cloud, 1000);
  const circumference = 239;
  const dashArr = (animCloud / 100) * circumference;
  return (
    <div className="cloud-ring">
      <svg viewBox="0 0 100 100" className="ring-svg">
        <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="38"
          fill="none"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dashArr} ${circumference}`}
          strokeDashoffset="60"
        />
      </svg>
      <div className="ring-center">
        <span className="ring-val">{Math.round(animCloud)}%</span>
        <span className="ring-lbl">Cloud</span>
      </div>
    </div>
  );
}

export default function App() {
  const { data, loading, error, fetchWeather } = useWeather();
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [spinning, setSpinning] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('skypulse_recent') || '[]'); }
    catch { return []; }
  });
  const currentQuery = useRef('London');
  const lastUpdated = useLastUpdated(fetchedAt);

  const search = useCallback((query: string) => {
    currentQuery.current = query;
    fetchWeather(query);
    setFetchedAt(Date.now());
    setRecentSearches(prev => {
      const cleaned = prev.filter(r => r.toLowerCase() !== query.toLowerCase());
      const next = [query, ...cleaned].slice(0, MAX_RECENT);
      localStorage.setItem('skypulse_recent', JSON.stringify(next));
      return next;
    });
  }, [fetchWeather]);

  const handleRefresh = () => {
    setSpinning(true);
    fetchWeather(currentQuery.current);
    setFetchedAt(Date.now());
    setTimeout(() => setSpinning(false), 800);
  };

  useEffect(() => { search('London'); }, []);

  const theme = data ? getTheme(data.current.condition.code, data.current.is_day === 1) : 'default';
  const isDay = data ? data.current.is_day === 1 : true;

  const temp   = data ? (unit === 'C' ? data.current.temp_c   : data.current.temp_f)   : 0;
  const feels  = data ? (unit === 'C' ? data.current.feelslike_c : data.current.feelslike_f) : 0;
  const wind   = data ? (unit === 'C' ? data.current.wind_kph  : data.current.wind_mph)  : 0;
  const gust   = data ? (unit === 'C' ? data.current.gust_kph  : data.current.gust_mph)  : 0;
  const windUnit = unit === 'C' ? 'km/h' : 'mph';

  const animTemp  = useAnimatedNumber(temp, 900);
  const animFeels = useAnimatedNumber(feels, 900);

  return (
    <div className={`app theme-${theme}`}>
      <div className="bg-layer" />
      <div className="particles">
        {theme === 'rainy' && [...Array(20)].map((_, i) => (
          <div key={i} className="particle rain-particle" style={{ '--i': i } as React.CSSProperties} />
        ))}
        {theme === 'snowy' && [...Array(16)].map((_, i) => (
          <div key={i} className="particle snow-particle" style={{ '--i': i } as React.CSSProperties}>❄</div>
        ))}
        {theme === 'sunny' && [...Array(6)].map((_, i) => (
          <div key={i} className="particle orb-particle" style={{ '--i': i } as React.CSSProperties} />
        ))}
        {theme === 'stormy' && [...Array(3)].map((_, i) => (
          <div key={i} className="particle bolt-particle" style={{ '--i': i } as React.CSSProperties}>⚡</div>
        ))}
      </div>

      <div className="container">
        <header className="app-header">
          <div className="logo">
            <svg viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="rgba(255,255,255,0.15)" />
              <path d="M16 8a5 5 0 014.9 6H22a4 4 0 010 8H10a4 4 0 010-8h1.1A5 5 0 0116 8z" fill="white" />
            </svg>
            <span>SkyPulse</span>
          </div>
          <SearchBar onSearch={search} loading={loading} recentSearches={recentSearches} />
        </header>

        {error && (
          <div className="error-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {!data && !loading && !error && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="36" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                <path d="M40 22a9 9 0 018.8 11H50a7 7 0 010 14H30a7 7 0 010-14h1.2A9 9 0 0140 22z" fill="rgba(255,255,255,0.6)" />
              </svg>
            </div>
            <h2>Search for a location</h2>
            <p>Enter a city name, zip code, or coordinates</p>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="pulse-ring" />
            <div className="pulse-ring delay" />
            <p>Fetching weather…</p>
          </div>
        )}

        {data && !loading && (
          <main className="weather-main" key={`${data.location.name}-${unit}`}>
            <div className="weather-hero">
              <div className="hero-left">
                <div className="location-info">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  <div>
                    <h1 className="city-name">{data.location.name}</h1>
                    <p className="city-region">{data.location.region}, {data.location.country}</p>
                  </div>
                </div>

                <div className="temp-display">
                  <span className="temp-main">{Math.round(animTemp)}°</span>
                  <div className="temp-meta">
                    <button
                      className="unit-toggle"
                      onClick={() => setUnit(u => u === 'C' ? 'F' : 'C')}
                      title={`Switch to °${unit === 'C' ? 'F' : 'C'}`}
                      aria-label={`Switch to ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
                    >
                      <span className={unit === 'C' ? 'active' : ''}>°C</span>
                      <span className="unit-sep">/</span>
                      <span className={unit === 'F' ? 'active' : ''}>°F</span>
                    </button>
                    <span className="feels-like">Feels {Math.round(animFeels)}°{unit}</span>
                  </div>
                </div>

                <div className="condition-badge">
                  <span>{data.current.condition.text}</span>
                </div>

                <div className="hero-actions">
                  <button
                    className={`refresh-btn ${spinning ? 'spinning' : ''}`}
                    onClick={handleRefresh}
                    title="Refresh weather"
                    aria-label="Refresh weather data"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8" strokeLinecap="round" />
                      <path d="M21 3v5h-5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16" strokeLinecap="round" />
                      <path d="M8 16H3v5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {lastUpdated && <span>Updated {lastUpdated}</span>}
                  </button>
                </div>
              </div>

              <div className="hero-right">
                <WeatherIcon code={data.current.condition.code} isDay={isDay} />
              </div>
            </div>

            <div className="stats-grid">
              <StatCard
                delay={0} color="#60a5fa" label="Humidity"
                numericValue={data.current.humidity} suffix="%" sub="Relative"
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v6M12 22v-6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M22 12h-6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24" strokeLinecap="round" /><circle cx="12" cy="12" r="2.5" /></svg>}
              />
              <StatCard
                delay={60} color="#34d399" label="Wind"
                numericValue={wind} suffix={` ${windUnit}`} decimals={1}
                sub={`Gust ${gust.toFixed(1)} ${windUnit}`}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" strokeLinecap="round" /></svg>}
              />
              <StatCard
                delay={120} color="#f59e0b" label="Visibility"
                numericValue={data.current.vis_km} suffix=" km" decimals={1}
                sub={data.current.vis_km >= 10 ? 'Excellent' : data.current.vis_km >= 5 ? 'Good' : 'Poor'}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
              />
              <StatCard
                delay={180} color="#a78bfa" label="UV Index"
                numericValue={data.current.uv} suffix="" decimals={1}
                sub={data.current.uv <= 2 ? 'Low' : data.current.uv <= 5 ? 'Moderate' : 'High'}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v1M12 20v1M4.22 4.22l.7.7M19.08 19.08l.7.7M3 12H2M22 12h-1M4.92 19.08l-.7.7M19.78 4.22l-.7.7" strokeLinecap="round" /><circle cx="12" cy="12" r="4" /></svg>}
              />
              <StatCard
                delay={240} color="#f472b6" label="Pressure"
                numericValue={data.current.pressure_mb} suffix=" mb" decimals={0}
                sub="Atmospheric"
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              />
              <StatCard
                delay={300} color="#38bdf8" label="Rain Chance"
                numericValue={data.current.chance_of_rain} suffix="%" decimals={0}
                sub="Probability"
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 17.58A5 5 0 0018 8h-1.26A8 8 0 104 15.25" strokeLinecap="round" /><polyline points="16 13 12 17 8 13" strokeLinecap="round" strokeLinejoin="round" /><line x1="12" y1="17" x2="12" y2="11" strokeLinecap="round" /></svg>}
              />
            </div>

            <div className="extra-row">
              <div className="glass-panel compass-panel">
                <h3>Wind Direction</h3>
                <WindCompass degree={data.current.wind_degree} dir={data.current.wind_dir} />
              </div>

              <div className="glass-panel uv-panel">
                <h3>UV Index</h3>
                <div className="uv-number">{data.current.uv.toFixed(1)}</div>
                <UVBar uv={data.current.uv} />
                <p className="uv-advice">
                  {data.current.uv <= 2 ? 'No protection needed' :
                   data.current.uv <= 5 ? 'Some protection recommended' :
                   data.current.uv <= 7 ? 'Protection essential' : 'Extra protection required'}
                </p>
              </div>

              <div className="glass-panel cloud-panel">
                <h3>Sky Condition</h3>
                <CloudRing cloud={data.current.cloud} />
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
