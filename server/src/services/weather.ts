import type { WeatherData } from '../types.js';

let cachedWeather: WeatherData | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: 'Cielo despejado',
  1: 'Mayormente despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Niebla',
  48: 'Niebla con escarcha',
  51: 'Llovizna leve',
  53: 'Llovizna moderada',
  55: 'Llovizna intensa',
  61: 'Lluvia leve',
  63: 'Lluvia moderada',
  65: 'Lluvia fuerte',
  71: 'Nevada leve',
  73: 'Nevada moderada',
  75: 'Nevada intensa',
  80: 'Chubascos leves',
  81: 'Chubascos moderados',
  82: 'Chubascos violentos',
  95: 'Tormenta eléctrica',
  96: 'Tormenta con granizo leve',
  99: 'Tormenta con granizo fuerte'
};

export async function fetchWeather(lat: number, lon: number, cityName: string): Promise<WeatherData | null> {
  const now = Date.now();
  if (cachedWeather && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedWeather;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP error: ${res.statusText}`);
    }

    const data = (await res.json()) as any;
    const current = data.current;
    const daily = data.daily;

    const forecast = (daily?.time || []).slice(0, 5).map((date: string, idx: number) => ({
      date,
      tempMax: Math.round(daily.temperature_2m_max[idx]),
      tempMin: Math.round(daily.temperature_2m_min[idx]),
      weatherCode: daily.weather_code[idx]
    }));

    const weatherCode = current?.weather_code ?? 0;
    cachedWeather = {
      city: cityName,
      temperature: Math.round(current?.temperature_2m ?? 0),
      weatherCode,
      description: WMO_DESCRIPTIONS[weatherCode] || 'Despejado',
      windSpeed: Math.round(current?.wind_speed_10m ?? 0),
      humidity: current?.relative_humidity_2m,
      forecast,
      updatedAt: new Date().toISOString()
    };
    lastFetchTime = now;
    return cachedWeather;
  } catch (error) {
    console.error('[Weather] Failed to fetch weather data:', error);
    return cachedWeather;
  }
}

