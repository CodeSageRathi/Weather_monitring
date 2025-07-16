export interface WeatherData {
  temperature: number;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  uvIndex: number;
  pressure: number;
  dewPoint: number;
  visibility: number;
}

export interface LocationData {
  name: string;
}

export const getWeatherInfo = (weatherCode: number): { text: string; emoji: string } => {
  const weatherMap: { [key: number]: { text: string; emoji: string } } = {
    0: { text: "Clear sky", emoji: "☀️" },
    1: { text: "Mainly clear", emoji: "🌤️" },
    2: { text: "Partly cloudy", emoji: "⛅️" },
    3: { text: "Overcast", emoji: "☁️" },
    45: { text: "Fog", emoji: "🌫️" },
    48: { text: "Depositing rime fog", emoji: "🌫️" },
    51: { text: "Light drizzle", emoji: "💧" },
    53: { text: "Moderate drizzle", emoji: "💧" },
    55: { text: "Dense drizzle", emoji: "💧" },
    61: { text: "Slight rain", emoji: "🌧️" },
    63: { text: "Moderate rain", emoji: "🌧️" },
    65: { text: "Heavy rain", emoji: "🌧️" },
    66: { text: "Light freezing rain", emoji: "🥶" },
    67: { text: "Heavy freezing rain", emoji: "🥶" },
    71: { text: "Slight snow fall", emoji: "❄️" },
    73: { text: "Moderate snow fall", emoji: "❄️" },
    75: { text: "Heavy snow fall", emoji: "❄️" },
    77: { text: "Snow grains", emoji: "❄️" },
    80: { text: "Slight rain showers", emoji: "🌦️" },
    81: { text: "Moderate rain showers", emoji: "🌦️" },
    82: { text: "Violent rain showers", emoji: "🌦️" },
    85: { text: "Slight snow showers", emoji: "🌨️" },
    86: { text: "Heavy snow showers", emoji: "🌨️" },
    95: { text: "Thunderstorm", emoji: "⛈️" },
    96: { text: "Thunderstorm with hail", emoji: "⛈️" },
    99: { text: "Thunderstorm with heavy hail", emoji: "⛈️" },
  };
  
  return weatherMap[weatherCode] || { text: "Unknown weather", emoji: "🤷" };
};

export const fetchWeatherByCity = async (city: string): Promise<WeatherData> => {
    // First, get coordinates for the city
    const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/search?city=${city}&countrycodes=IN&format=json&limit=1`);
    if (!geocodeResponse.ok) {
        throw new Error(`Failed to geocode city: ${city}`);
    }
    const geocodeData = await geocodeResponse.json();
    if (geocodeData.length === 0) {
        throw new Error(`Could not find location for city: ${city}`);
    }
    const { lat, lon } = geocodeData[0];

    // Then, fetch weather for those coordinates
    const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index,surface_pressure,dew_point_2m,visibility`
    );
    if (!weatherResponse.ok) {
        throw new Error("Failed to fetch weather data.");
    }
    const weatherData = await weatherResponse.json();

    return {
      temperature: Math.round(weatherData.current.temperature_2m),
      weatherCode: weatherData.current.weather_code,
      humidity: weatherData.current.relative_humidity_2m,
      windSpeed: Math.round(weatherData.current.wind_speed_10m),
      feelsLike: Math.round(weatherData.current.apparent_temperature),
      uvIndex: Math.round(weatherData.current.uv_index),
      pressure: Math.round(weatherData.current.surface_pressure),
      dewPoint: Math.round(weatherData.current.dew_point_2m),
      visibility: Math.round(weatherData.current.visibility / 1000), // to km
    };
};


export const fetchWeatherAndLocation = async (
  latitude: number,
  longitude: number
): Promise<{ weather: WeatherData; location: LocationData }> => {
  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index,surface_pressure,dew_point_2m,visibility`
  );
  if (!weatherResponse.ok) {
    throw new Error("Failed to fetch weather data.");
  }
  const weatherData = await weatherResponse.json();

  const locationResponse = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
  );
  if (!locationResponse.ok) {
    throw new Error("Failed to fetch location data.");
  }
  const locationData = await locationResponse.json();

  const cityName = locationData.address.city || locationData.address.town || locationData.address.village || locationData.address.county || "Unknown location";

  return {
    weather: {
      temperature: Math.round(weatherData.current.temperature_2m),
      weatherCode: weatherData.current.weather_code,
      humidity: weatherData.current.relative_humidity_2m,
      windSpeed: Math.round(weatherData.current.wind_speed_10m),
      feelsLike: Math.round(weatherData.current.apparent_temperature),
      uvIndex: Math.round(weatherData.current.uv_index),
      pressure: Math.round(weatherData.current.surface_pressure), // API gives hPa directly
      dewPoint: Math.round(weatherData.current.dew_point_2m),
      visibility: Math.round(weatherData.current.visibility / 1000), // to km
    },
    location: {
      name: cityName,
    },
  };
};
