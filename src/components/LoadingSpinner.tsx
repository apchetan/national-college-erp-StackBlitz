interface LoadingSpinnerProps {
  variant?: 'page' | 'inline' | 'skeleton';
  count?: number;
}

export function LoadingSpinner({ variant = 'page', count = 4 }: LoadingSpinnerProps) {
  if (variant === 'skeleton') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-gray-200 animate-pulse"
          />
        ))}
      </>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600" />
      <p className="mt-4 text-gray-600 animate-pulse">Loading...</p>
    </div>
  );
}
