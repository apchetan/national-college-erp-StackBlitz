import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnlineBanner, setShowOnlineBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineBanner(true);
      setTimeout(() => {
        setShowOnlineBanner(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineBanner(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showOnlineBanner) {
    return null;
  }

  if (!isOnline) {
    return (
      <div className="fixed top-16 left-0 right-0 z-40 bg-yellow-500 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <WifiOff className="w-5 h-5" />
          <span className="font-medium">You are offline. Some features may not work.</span>
        </div>
      </div>
    );
  }

  if (showOnlineBanner) {
    return (
      <div className="fixed top-16 left-0 right-0 z-40 bg-green-500 text-white px-4 py-3 shadow-lg transition-opacity duration-300">
        <div className="flex items-center justify-center gap-2">
          <Wifi className="w-5 h-5" />
          <span className="font-medium">Back online!</span>
        </div>
      </div>
    );
  }

  return null;
}
