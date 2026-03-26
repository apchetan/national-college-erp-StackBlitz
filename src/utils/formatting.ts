export function formatDate(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'new': 'bg-blue-100 text-blue-800',
    'contacted': 'bg-yellow-100 text-yellow-800',
    'qualified': 'bg-green-100 text-green-800',
    'converted': 'bg-emerald-100 text-emerald-800',
    'closed': 'bg-gray-100 text-gray-800',
    'in_progress': 'bg-orange-100 text-orange-800',
    'resolved': 'bg-teal-100 text-teal-800',
    'scheduled': 'bg-sky-100 text-sky-800',
    'confirmed': 'bg-indigo-100 text-indigo-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
    'no_show': 'bg-rose-100 text-rose-800',
    'applied': 'bg-blue-100 text-blue-800',
    'under_review': 'bg-purple-100 text-purple-800',
    'accepted': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'enrolled': 'bg-emerald-100 text-emerald-800',
    'withdrawn': 'bg-gray-100 text-gray-800',
    'pending': 'bg-amber-100 text-amber-800',
    'partial': 'bg-orange-100 text-orange-800',
    'paid': 'bg-green-100 text-green-800',
  };

  return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '₹0';

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0';

  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
