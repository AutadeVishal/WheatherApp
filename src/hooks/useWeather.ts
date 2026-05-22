import { useState, useCallback } from 'react';
import type { WeatherResponse } from '../types/weather';

const API_KEY = '6f656e4e58ed4a8a90141418262205';
const BASE_URL = 'https://api.weatherapi.com/v1/current.json';

export function useWeather() {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(query)}&aqi=no`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || 'Location not found');
      }
      const json: WeatherResponse = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchWeather };
}
