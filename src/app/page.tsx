'use client';

import { useState, useEffect } from 'react';
import { getPersonalizedReport } from '@/lib/actions';
import { fetchWeatherAndLocation, getWeatherInfo, type WeatherData } from '@/lib/weather';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal, Cloud, User, MapPin, Wind, Droplets, Sun, Sunrise, Sunset, Eye, Gauge, Thermometer } from "lucide-react";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import IndiaMap from '@/components/IndiaMap';

// Mock Data for UI development - will be replaced by API data
const MOCK_HOURLY_FORECAST = Array.from({ length: 12 }, (_, i) => ({
  time: `${(new Date().getHours() + i + 1) % 24}:00`,
  temp: `${Math.floor(Math.random() * 10) + 15}°`,
  icon: <Cloud size={24} />,
}));

const MOCK_WEEKLY_FORECAST = [
  { day: 'Monday', temp: '22°/14°', icon: <Cloud size={24} /> },
  { day: 'Tuesday', temp: '24°/15°', icon: <Sun size={24} /> },
  { day: 'Wednesday', temp: '21°/13°', icon: <Cloud size={24} /> },
  { day: 'Thursday', temp: '25°/16°', icon: <Sun size={24} /> },
  { day: 'Friday', temp: '23°/15°', icon: <Cloud size={24} /> },
  { day: 'Saturday', temp: '20°/12°', icon: <Cloud size={24} /> },
  { day: 'Sunday', temp: '22°/14°', icon: <Sun size={24} /> },
];

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Detecting your location...");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLoadingMessage("Fetching weather data...");
          try {
            const { latitude, longitude } = position.coords;
            const { weather, location } = await fetchWeatherAndLocation(latitude, longitude);
            setWeather(weather);
            setLocationName(location.name);
          } catch (err) {
            setError("Could not fetch weather data. Please try again later.");
            console.error(err);
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          setError("Location access denied. Please enable location services in your browser settings to see local weather.");
          setLoading(false);
          console.error(err);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  }, []);
  
  const weatherBackgroundClass = () => {
    if (!weather) return 'from-gray-400 to-slate-600'; // Default background
    const code = weather.weatherCode;
    if ([0, 1].includes(code)) return 'from-orange-400 to-yellow-500'; // Sunny
    if ([61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) return 'from-teal-500 to-blue-700'; // Rainy/Thunderstorm
    return 'from-gray-400 to-slate-600'; // Cloudy/Foggy
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${weatherBackgroundClass()} text-white transition-colors duration-1000`}>
      <header className="flex items-center justify-between p-4 backdrop-blur-md bg-white/10 rounded-b-xl shadow-lg">
        <div className="flex items-center gap-2">
          <Cloud size={32} className="text-white" />
          <h1 className="text-2xl font-bold">SkyWatch</h1>
        </div>
        <div className="w-full max-w-xs">
          <Input type="search" placeholder="Search city..." className="bg-white/20 border-white/30 placeholder:text-white/70 focus:bg-white/30 focus:ring-white/50" />
        </div>
        <Button variant="ghost" size="icon">
          <User size={24} />
        </Button>
      </header>

      <main className="p-4 sm:p-6 md:p-8 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
            <Loader2 className="animate-spin h-12 w-12 mb-4" />
            <p className="text-lg">{loadingMessage}</p>
          </div>
        ) : error ? (
           <Alert variant="destructive" className="max-w-md mx-auto bg-red-500/50 text-white border-red-500">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : weather && locationName ? (
          <>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white shadow-lg">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center">India Climate Map</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                   <IndiaMap />
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Current Weather Card */}
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <div>
                        <h2 className="text-3xl font-bold">{locationName}</h2>
                        <p className="text-base font-normal">{getWeatherInfo(weather.weatherCode).text}</p>
                      </div>
                      <div className="text-6xl">{getWeatherInfo(weather.weatherCode).emoji}</div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-8xl font-bold">{weather.temperature}°C</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2"><Thermometer size={16} /> Feels like: {weather.feelsLike}°C</div>
                        <div className="flex items-center gap-2"><Droplets size={16} /> Humidity: {weather.humidity}%</div>
                        <div className="flex items-center gap-2"><Wind size={16} /> Wind: {weather.windSpeed} km/h</div>
                        <div className="flex items-center gap-2"><Sun size={16} /> UV Index: {weather.uvIndex}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Hourly Forecast */}
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white shadow-lg">
                  <CardHeader><CardTitle>Hourly Forecast</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex space-x-4 overflow-x-auto pb-2">
                      {MOCK_HOURLY_FORECAST.map((hour, index) => (
                        <div key={index} className="flex flex-col items-center flex-shrink-0 space-y-1 p-2 rounded-lg bg-white/10">
                          <span>{hour.time}</span>
                          {hour.icon}
                          <span className="font-bold">{hour.temp}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-1 space-y-6">
                {/* Weekly Forecast */}
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white shadow-lg">
                  <CardHeader><CardTitle>7-Day Forecast</CardTitle></CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {MOCK_WEEKLY_FORECAST.map((day, index) => (
                        <AccordionItem value={`item-${index}`} key={index} className="border-white/20">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex justify-between items-center w-full">
                              <span>{day.day}</span>
                              <div className="flex items-center gap-2">
                                {day.icon}
                                <span>{day.temp}</span>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            Detailed forecast for {day.day} will go here.
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
                {/* Weather Alerts */}
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white shadow-lg">
                  <CardHeader><CardTitle>Weather Alerts</CardTitle></CardHeader>
                  <CardContent>
                    <p>No active alerts.</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Bottom Panel */}
              <div className="lg:col-span-3">
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white shadow-lg">
                  <CardHeader><CardTitle>Today's Highlights</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
                      <div className="p-2 rounded-lg bg-white/10">
                        <p className="text-sm text-white/80">Air Quality</p><p className="font-bold">Good</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/10">
                        <p className="text-sm text-white/80">Sunrise</p><p className="font-bold">6:05 AM</p>
                      </div>
                       <div className="p-2 rounded-lg bg-white/10">
                        <p className="text-sm text-white/80">Sunset</p><p className="font-bold">8:30 PM</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/10">
                        <p className="text-sm text-white/80">Pressure</p><p className="font-bold">{weather.pressure} hPa</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/10">
                        <p className="text-sm text-white/80">Dew Point</p><p className="font-bold">{weather.dewPoint}°C</p>
                      </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          !loading && <div className="text-center">Could not display weather. Please ensure location is enabled and refresh.</div>
        )}
      </main>
    </div>
  );
}
