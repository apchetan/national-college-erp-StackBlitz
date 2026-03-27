import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, Calendar, ListChecks, Menu, X, Users, GraduationCap, Wallet, ClipboardCheck, Settings, Download, Upload } from 'lucide-react';

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const mainItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/enquiry', icon: FileText, label: 'Enquiry' },
    { path: '/appointment', icon: Calendar, label: 'Appointment' },
    { path: '/status-search', icon: ListChecks, label: 'Status' },
  ];

  const moreItems = [
    { path: '/admission', icon: GraduationCap, label: 'Admission' },
    { path: '/fee-payment', icon: Wallet, label: 'Fee Payment' },
    { path: '/student-status', icon: ClipboardCheck, label: 'Student Status' },
    { path: '/support', icon: Users, label: 'Support' },
    { path: '/admin', icon: Settings, label: 'Admin' },
    { path: '/data-import', icon: Upload, label: 'Import' },
    { path: '/data-export', icon: Download, label: 'Export' },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setShowMore(false);
  };

  return (
    <>
      {showMore && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setShowMore(false)}
        />
      )}

      <div
        className={`fixed bottom-0 left-0 right-0 bg-white transform transition-transform duration-300 z-40 md:hidden ${
          showMore ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '70vh' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">More Options</h3>
          <button
            onClick={() => setShowMore(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(70vh - 64px)' }}>
          <div className="grid grid-cols-2 gap-3">
            {moreItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition ${
                  isActive(item.path)
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs font-medium text-center">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden pb-safe">
        <div className="h-16 flex items-center justify-around px-2">
          {mainItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition ${
                isActive(item.path) ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <div
                className={`p-2 rounded-lg transition ${
                  isActive(item.path) ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' : ''
                }`}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition ${
              showMore ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <div
              className={`p-2 rounded-lg transition ${
                showMore ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' : ''
              }`}
            >
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
