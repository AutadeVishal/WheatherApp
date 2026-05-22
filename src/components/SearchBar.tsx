import React, { useState, useRef } from 'react';

interface Props {
  onSearch: (query: string) => void;
  loading: boolean;
  recentSearches: string[];
}

export const SearchBar: React.FC<Props> = ({ onSearch, loading, recentSearches }) => {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const SUGGESTIONS = ['London', 'New York', 'Tokyo', 'Paris', 'Dubai', 'Sydney', 'Mumbai', 'Toronto'];

  const filtered = value.length > 0
    ? SUGGESTIONS.filter(s => s.toLowerCase().startsWith(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase())
    : [];

  const showRecent = value.length === 0 && recentSearches.length > 0;

  const submit = (q: string) => {
    if (!q.trim()) return;
    onSearch(q.trim());
    setValue(q);
    setFocused(false);
    inputRef.current?.blur();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submit(value);
    if (e.key === 'Escape') { setFocused(false); inputRef.current?.blur(); }
  };

  const handleGeo = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const q = `${pos.coords.latitude},${pos.coords.longitude}`;
        onSearch(q);
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { timeout: 8000 }
    );
  };

  const showDropdown = focused && (filtered.length > 0 || showRecent);

  return (
    <div className={`search-wrapper ${focused ? 'focused' : ''}`}>
      <div className="search-bar">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="City, zip, or coordinates…"
          value={value}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={handleKey}
          autoComplete="off"
          spellCheck={false}
        />

        <button
          className={`geo-btn ${geoLoading ? 'loading' : ''}`}
          onClick={handleGeo}
          title="Use my location"
          aria-label="Use my location"
          disabled={geoLoading || loading}
        >
          {geoLoading ? (
            <div className="search-spinner sm" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
              <circle cx="12" cy="12" r="8" strokeDasharray="2 4" />
            </svg>
          )}
        </button>

        {loading ? (
          <div className="search-spinner" />
        ) : (
          <button className="search-btn" onClick={() => submit(value)} aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {showDropdown && (
        <ul className="suggestions">
          {showRecent && (
            <>
              <li className="suggestion-header">Recent</li>
              {recentSearches.map(s => (
                <li key={`r-${s}`} onMouseDown={() => submit(s)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {s}
                </li>
              ))}
            </>
          )}
          {filtered.map(s => (
            <li key={s} onMouseDown={() => submit(s)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
