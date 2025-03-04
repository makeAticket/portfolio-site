import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiWind, FiDroplet } from 'react-icons/fi';
import { WiDaySunny, WiCloud, WiCloudy, WiRain, WiSnow, WiThunderstorm, WiFog, WiNightClear } from 'react-icons/wi';
import useSWR from 'swr';

interface WeatherData {
  location: {
    city: string;
    country: string;
  };
  temperature: {
    current: number;
    feelsLike: number;
    min: number;
    max: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  };
  wind: {
    speed: number;
    deg: number;
  };
  humidity: number;
  timestamp: string;
}

// Fallback weather data
const fallbackData: WeatherData = {
  location: {
    city: "Philadelphia",
    country: "US",
  },
  temperature: {
    current: 72,
    feelsLike: 73,
    min: 68,
    max: 75,
  },
  weather: {
    main: "Clear",
    description: "clear sky",
    icon: "01d",
  },
  wind: {
    speed: 5,
    deg: 220,
  },
  humidity: 65,
  timestamp: new Date().toISOString(),
};

const fetcher = (url: string) => 
  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    })
    .catch(err => {
      console.error('Error fetching weather data:', err);
      return fallbackData;
    });

export default function WeatherWidget() {
  const [expanded, setExpanded] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  
  // Use SWR for data fetching
  const { data, error, isLoading, mutate } = useSWR<WeatherData>(
    '/api/weather',
    fetcher,
    {
      refreshInterval: 900000, // Refresh every 15 minutes
      revalidateOnFocus: true,
      dedupingInterval: 300000, // 5 minutes
      fallbackData: fallbackData, // Always have fallback data
    }
  );
  
  // Force a refresh on mount
  useEffect(() => {
    mutate();
  }, [mutate]);
  
  // If loading takes too long, show fallback
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setShowFallback(true);
      }, 3000);
      
      return () => clearTimeout(timeout);
    } else {
      setShowFallback(false);
    }
  }, [isLoading]);

  // Get weather data
  const weather = data || fallbackData;
  const loading = isLoading && !showFallback;

  // Get the appropriate weather icon
  const getWeatherIcon = () => {
    const iconCode = weather.weather.icon;
    const isDay = iconCode.includes('d');
    const condition = weather.weather.main.toLowerCase();
    
    if (condition.includes('clear')) {
      return isDay ? <WiDaySunny size={36} className="text-yellow-400" /> : <WiNightClear size={36} className="text-blue-300" />;
    } else if (condition.includes('cloud') && !condition.includes('broken')) {
      return <WiCloud size={36} className="text-gray-400" />;
    } else if (condition.includes('broken') || condition.includes('overcast')) {
      return <WiCloudy size={36} className="text-gray-500" />;
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
      return <WiRain size={36} className="text-blue-400" />;
    } else if (condition.includes('snow')) {
      return <WiSnow size={36} className="text-blue-100" />;
    } else if (condition.includes('thunder')) {
      return <WiThunderstorm size={36} className="text-yellow-500" />;
    } else if (condition.includes('fog') || condition.includes('mist') || condition.includes('haze')) {
      return <WiFog size={36} className="text-gray-300" />;
    }
    
    return <WiDaySunny size={36} className="text-yellow-400" />;
  };

  return (
    <motion.div
      className="glass-effect rounded-md overflow-hidden w-[280px]"
      transition={{ duration: 0.3 }}
    >
      <div className="p-3 w-full">
        <div className="flex items-center mb-4">
          <FiMapPin size={20} className="text-secondary mr-2" />
          <p className="text-sm font-mono text-textPrimary flex items-center">
            {loading ? 'Fetching weather...' :
             error ? 'Weather unavailable' : (
              <>
                Current Weather
                <span className="ml-2 h-2 w-2 rounded-full bg-blue-400 inline-block shadow-[0_0_8px_#60A5FA] border border-blue-400/30"></span>
              </>
             )}
          </p>
        </div>

        {loading ? (
          <div className="animate-pulse flex space-x-4 items-center">
            <div className="rounded-md bg-tertiary h-12 w-12"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-2 bg-tertiary rounded"></div>
              <div className="h-2 bg-tertiary rounded w-5/6"></div>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="mr-4">
              {getWeatherIcon()}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-2xl text-textPrimary font-semibold">
                  {weather.temperature.current}°F
                </p>
                <p className="text-sm text-textSecondary">
                  {weather.location.city}
                </p>
              </div>
              <p className="text-sm text-textSecondary capitalize">
                {weather.weather.description}
              </p>
              <div className="flex text-xs text-textSecondary mt-1">
                <div className="flex items-center mr-3">
                  <FiWind size={12} className="mr-1" />
                  <span>{weather.wind.speed} mph</span>
                </div>
                <div className="flex items-center">
                  <FiDroplet size={12} className="mr-1" />
                  <span>{weather.humidity}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}