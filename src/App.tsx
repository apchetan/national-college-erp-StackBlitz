import { useState, createContext, useContext } from 'react';
import { EnquiryForm } from './components/EnquiryForm';
import { SupportForm } from './components/SupportForm';
import { AppointmentBooking } from './components/AppointmentBooking';
import { AdmissionForm } from './components/AdmissionForm';
import { BalanceFeePayment } from './components/BalanceFeePayment';
import { StudentStatusForm } from './components/StudentStatusForm';
import { CourierStatus } from './components/CourierStatus';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { StatusSearch } from './components/StatusSearch';
import { Login } from './components/Login';
import { useAuth } from './contexts/AuthContext';
import { LayoutDashboard, FileText, Calendar, GraduationCap, Menu, X, Shield, LogOut, User, ListChecks, Wallet, HeadphonesIcon, ClipboardCheck, Truck } from 'lucide-react';

type Page = 'dashboard' | 'enquiry' | 'support' | 'appointment' | 'admission' | 'admin' | 'status' | 'balance-fee' | 'student-status' | 'courier-status';

interface NavigationContextType {
  setCurrentPage: (page: Page) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, signOut, isAdmin } = useAuth();

  // Debug: Log profile state
  console.log('Profile state:', { profile, isAdmin });

  // Build navigation with Admin Panel for admins
  const mainNavigation = [
    { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' as Page },
    { name: 'Status', icon: ListChecks, id: 'status' as Page },
  ];

  // Use isAdmin from context instead of manual check
  if (isAdmin) {
    mainNavigation.push({ name: 'Admin Panel', icon: Shield, id: 'admin' as Page });
  }

  const formsNavigation = [
    { name: 'Enquiry Form', icon: FileText, id: 'enquiry' as Page, color: 'from-blue-500 to-blue-600', hoverColor: 'hover:from-blue-600 hover:to-blue-700', bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    { name: 'Support Form', icon: HeadphonesIcon, id: 'support' as Page, color: 'from-emerald-500 to-emerald-600', hoverColor: 'hover:from-emerald-600 hover:to-emerald-700', bgColor: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
    { name: 'Book Appointment', icon: Calendar, id: 'appointment' as Page, color: 'from-cyan-500 to-cyan-600', hoverColor: 'hover:from-cyan-600 hover:to-cyan-700', bgColor: 'bg-gradient-to-r from-cyan-500 to-cyan-600' },
    { name: 'Admission Form', icon: GraduationCap, id: 'admission' as Page, color: 'from-orange-500 to-orange-600', hoverColor: 'hover:from-orange-600 hover:to-orange-700', bgColor: 'bg-gradient-to-r from-orange-500 to-orange-600' },
    { name: 'Fee Payment', icon: Wallet, id: 'balance-fee' as Page, color: 'from-teal-500 to-teal-600', hoverColor: 'hover:from-teal-600 hover:to-teal-700', bgColor: 'bg-gradient-to-r from-teal-500 to-teal-600' },
    { name: 'Update Status Form', icon: ClipboardCheck, id: 'student-status' as Page, color: 'from-amber-500 to-amber-600', hoverColor: 'hover:from-amber-600 hover:to-amber-700', bgColor: 'bg-gradient-to-r from-amber-500 to-amber-600' },
    { name: 'Courier Status', icon: Truck, id: 'courier-status' as Page, color: 'from-rose-500 to-rose-600', hoverColor: 'hover:from-rose-600 hover:to-rose-700', bgColor: 'bg-gradient-to-r from-rose-500 to-rose-600' },
  ];

  return (
    <NavigationContext.Provider value={{ setCurrentPage }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
            {/* Main Menu Ribbon */}
            <div className="border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center gap-3">
                    <div className="leading-none">
                      <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent leading-none mb-0.5">Mirror Dashboard</h1>
                      <p className="text-xs font-semibold text-emerald-600 leading-none">(ERP-CRM)</p>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-2">
                    {mainNavigation.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setCurrentPage(item.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
                          currentPage === item.id
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                            : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </button>
                    ))}

                    <div className="ml-4 flex items-center gap-2 pl-4 border-l border-gray-300">
                      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{profile?.full_name}</span>
                      </div>
                      <button
                        onClick={signOut}
                        className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all duration-200 transform hover:scale-105"
                        title="Sign Out"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all duration-200"
                  >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Forms Ribbon */}
            <div className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="hidden md:flex items-center gap-3 py-4 overflow-x-auto scrollbar-thin">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">Forms:</span>
                  {formsNavigation.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentPage(item.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 whitespace-nowrap shadow-sm ${
                        currentPage === item.id
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                          : `bg-white text-gray-700 hover:shadow-md border border-gray-200 ${item.hoverColor} hover:text-white`
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t border-gray-200 bg-white animate-slide-down">
                <div className="px-4 py-3 space-y-2">
                  <div className="mb-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Main Menu</p>
                    {mainNavigation.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentPage(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 mb-2 ${
                          currentPage === item.id
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </button>
                    ))}
                  </div>

                  <div className="mb-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Forms</p>
                    {formsNavigation.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentPage(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 mb-2 ${
                          currentPage === item.id
                            ? `bg-gradient-to-r ${item.color} text-white shadow-md`
                            : 'text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2 px-4 py-2 mb-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">{profile?.full_name}</span>
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200 border border-red-200"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'enquiry' && <EnquiryForm />}
          {currentPage === 'support' && <SupportForm />}
          {currentPage === 'appointment' && <AppointmentBooking />}
          {currentPage === 'admission' && <AdmissionForm />}
          {currentPage === 'balance-fee' && <BalanceFeePayment />}
          {currentPage === 'student-status' && <StudentStatusForm />}
          {currentPage === 'courier-status' && <CourierStatus />}
          {currentPage === 'status' && <StatusSearch />}
          {currentPage === 'admin' && <AdminPanel />}
        </main>

        <footer className="bg-gradient-to-r from-white via-gray-50 to-white border-t border-gray-200 mt-16 shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-600 text-sm">
              <span className="font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Mirror</span> <span className="text-xs">(ERP-CRM)</span> <span className="text-emerald-600 font-bold">by Dr. Chetan</span> - All data is securely stored and interconnected
            </p>
          </div>
        </footer>
      </div>
    </NavigationContext.Provider>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
          <p className="text-gray-700 font-medium text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <AppContent />;
}

export default App;
