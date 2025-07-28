'use client';

import { useState, useEffect } from 'react';
import { getPersonalizedReport, submitChatMessage } from '@/lib/actions';
import { fetchWeatherByCity, fetchWeatherAndLocation, getWeatherInfo, type WeatherData, type HourlyForecast, type WeeklyForecast } from '@/lib/weather';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal, Cloud, User, MapPin, Wind, Droplets, Sun, Sunrise, Sunset, Eye, Gauge, Thermometer, BrainCircuit } from "lucide-react";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Chatbot } from '@/components/ui/chatbot';

const MAJOR_CITIES = ["Delhi", "Mumbai", "Bengaluru", "Kolkata"];

interface CityWeather {
  city: string;
  weather: WeatherData | null;
}

const CityWeatherCard = ({ city, weather }: { city: string, weather: WeatherData | null }) => {
  if (!weather) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white shadow-lg flex flex-col items-center justify-center p-4 min-h-[120px]">
        <Loader2 className="animate-spin h-6 w-6" />
        <span className="mt-2 text-sm">{city}</span>
      </Card>
    );
  }

  const { text, emoji } = getWeatherInfo(weather.weatherCode);

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white shadow-lg p-4 flex flex-col items-center text-center">
      <h3 className="font-bold text-lg">{city}</h3>
      <div className="text-4xl my-2">{emoji}</div>
      <p className="text-2xl font-bold">{weather.temperature}°C</p>
      <p className="text-xs text-white/80">{text}</p>
    </Card>
  );
};


export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [weeklyForecast, setWeeklyForecast] = useState<WeeklyForecast[]>([]);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [majorCitiesWeather, setMajorCitiesWeather] = useState<CityWeather[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Detecting your location...");
  const [searchQuery, setSearchQuery] = useState('');
  const [personalizedReport, setPersonalizedReport] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery) {
      setLoading(true);
      setLoadingMessage(`Searching for ${searchQuery}...`);
      setError(null);
      try {
        const { weather, location, hourly, weekly } = await fetchWeatherByCity(searchQuery);
        setWeather(weather);
        setLocationName(location.name);
        setHourlyForecast(hourly);
        setWeeklyForecast(weekly);
      } catch (err) {
        setError(`Could not find weather for "${searchQuery}". Please try another city.`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePersonalizedReport = async () => {
    if (!weather || !locationName) return;
    setLoadingReport(true);
    setPersonalizedReport(null);
    try {
      const report = await getPersonalizedReport({
        temperature: weather.temperature,
        weatherConditions: getWeatherInfo(weather.weatherCode).text,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        locationName: locationName,
      });
      setPersonalizedReport(report);
    } catch (err) {
      console.error("Failed to get personalized report", err);
      setPersonalizedReport("Sorry, I couldn't generate a personalized report at this time.");
    } finally {
      setLoadingReport(false);
    }
  };
  
  const loadWeatherForCoords = async (latitude: number, longitude: number) => {
    setLoadingMessage("Fetching weather data...");
    try {
      const { weather, location, hourly, weekly } = await fetchWeatherAndLocation(latitude, longitude);
      setWeather(weather);
      setLocationName(location.name);
      setHourlyForecast(hourly);
      setWeeklyForecast(weekly);
      setError(null);
    } catch (err) {
      setError("Could not fetch local weather. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const fetchInitialWeather = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            loadWeatherForCoords(position.coords.latitude, position.coords.longitude);
          },
          (err) => {
            console.warn(`Geolocation failed: ${err.message}. Using fallback location.`);
            // Use fallback coordinates for New York as an example
            loadWeatherForCoords(40.7128, -74.0060); 
             switch (err.code) {
              case err.PERMISSION_DENIED:
                setError("Location access denied. Showing weather for a default city. You can use the search bar to find your location.");
                break;
              default:
                setError("Could not determine your location. Showing weather for a default city. You can use the search bar to find another location.");
                break;
            }
          }
        );
      } else {
        setError("Geolocation is not supported. Showing weather for a default city.");
        // Use fallback coordinates for New York as an example
        loadWeatherForCoords(40.7128, -74.0060); 
        setLoading(false);
      }
    };
    
    fetchInitialWeather();
    
    // Fetch weather for major cities
    const fetchCitiesWeather = async () => {
      const citiesData = await Promise.all(MAJOR_CITIES.map(async (city) => {
        try {
          const { weather } = await fetchWeatherByCity(city);
          return { city, weather };
        } catch (error) {
          console.error(`Failed to fetch weather for ${city}`, error);
          return { city, weather: null };
        }
      }));
      setMajorCitiesWeather(citiesData);
    };

    fetchCitiesWeather();

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
          <Input 
            type="search" 
            placeholder="Search city and press Enter..." 
            className="bg-white/20 border-white/30 placeholder:text-white/70 focus:bg-white/30 focus:ring-white/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
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
        ) : error && !weather ? ( // Only show full-screen error if there's no weather data at all
           <Alert variant="destructive" className="max-w-md mx-auto bg-red-500/50 text-white border-red-500">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : weather && locationName ? (
          <>
            {error && ( // Show non-blocking error toast if weather data is available
              <Alert variant="destructive" className="max-w-md mx-auto mb-4 bg-red-500/80 text-white border-red-500">
                <Terminal className="h-4 w-4" />
                <AlertTitle>A quick heads-up!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Weather in Major Cities</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {majorCitiesWeather.map(({ city, weather }) => (
                     <CityWeatherCard key={city} city={city} weather={weather} />
                   ))}
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
                
                {/* Chatbot */}
                <Chatbot 
                  weather={weather}
                  locationName={locationName}
                  handleChatSubmit={submitChatMessage}
                />
                
                {/* Personalized AI Report */}
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BrainCircuit />
                            Personalized Report
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingReport ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin" />
                                <p>Generating your personalized report...</p>
                            </div>
                        ) : personalizedReport ? (
                            <p>{personalizedReport}</p>
                        ) : (
                             <Button onClick={handlePersonalizedReport} disabled={loadingReport}>
                                Generate AI-Powered Advice
                            </Button>
                        )}
                    </CardContent>
                </Card>

              </div>

              {/* Right Column */}
              <div className="lg:col-span-1 space-y-6">
                 {/* Hourly Forecast */}
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white shadow-lg">
                  <CardHeader><CardTitle>Hourly Forecast</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex space-x-4 overflow-x-auto pb-2">
                      {hourlyForecast.map((hour, index) => (
                        <div key={index} className="flex flex-col items-center flex-shrink-0 space-y-1 p-2 rounded-lg bg-white/10">
                          <span>{hour.time}</span>
                          <div className="text-2xl">{getWeatherInfo(hour.weatherCode).emoji}</div>
                          <span className="font-bold">{hour.temp}°C</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly Forecast */}
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white shadow-lg">
                  <CardHeader><CardTitle>7-Day Forecast</CardTitle></CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {weeklyForecast.map((day, index) => (
                        <AccordionItem value={`item-${index}`} key={index} className="border-white/20">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex justify-between items-center w-full">
                              <span>{day.day}</span>
                              <div className="flex items-center gap-2">
                                <div className="text-2xl">{getWeatherInfo(day.weatherCode).emoji}</div>
                                <span>{day.tempMax}°/{day.tempMin}°</span>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                           {getWeatherInfo(day.weatherCode).text} throughout the day.
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
                
                 {/* Today's Highlights */}
                <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white shadow-lg">
                  <CardHeader><CardTitle>Today's Highlights</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-2 rounded-lg bg-white/10">
                        <p className="text-sm text-white/80">Air Quality</p><p className="font-bold">Good</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/10">
                        <p className="text-sm text-white/80">Sunrise</p><p className="font-bold">{new Date(weather.sunrise).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                       <div className="p-2 rounded-lg bg-white/10">
                        <p className="text-sm text-white/80">Sunset</p><p className="font-bold">{new Date(weather.sunset).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/10">
                        <p className="text-sm text-white/80">Pressure</p><p className="font-bold">{weather.pressure} hPa</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/10">
                        <p className="text-sm text-white/80">Dew Point</p><p className="font-bold">{weather.dewPoint}°C</p>
                      </div>
                       <div className="p-2 rounded-lg bg-white/10">
                        <p className="text-sm text-white/80">Visibility</p><p className="font-bold">{weather.visibility} km</p>
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
