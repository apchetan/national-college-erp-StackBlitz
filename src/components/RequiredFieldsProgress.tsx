interface RequiredFieldsProgressProps {
  completed: number;
  total: number;
}

export function RequiredFieldsProgress({ completed, total }: RequiredFieldsProgressProps) {
  if (total === 0) return null;

  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {completed} of {total} required fields completed
        </span>
        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
