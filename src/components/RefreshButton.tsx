import { RefreshCw } from 'lucide-react';

interface RefreshButtonProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function RefreshButton({ onRefresh, isRefreshing }: RefreshButtonProps) {
  return (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      className="p-2 rounded-full hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Refresh data"
      title="Refresh data"
    >
      <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
    </button>
  );
}
