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

  console.log('Profile:', profile);
  console.log('Is Admin:', isAdmin);

  const mainNavigation = [
    { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' as Page },
    { name: 'Status', icon: ListChecks, id: 'status' as Page },
  ];

  if (isAdmin) {
    console.log('Adding Admin Panel to navigation');
    mainNavigation.push({ name: 'Admin Panel', icon: Shield, id: 'admin' as Page });
  }

  const formsNavigation = [
    { name: 'Enquiry Form', icon: FileText, id: 'enquiry' as Page },
    { name: 'Support Form', icon: HeadphonesIcon, id: 'support' as Page },
    { name: 'Book Appointment', icon: Calendar, id: 'appointment' as Page },
    { name: 'Admission Form', icon: GraduationCap, id: 'admission' as Page },
    { name: 'Fee Payment', icon: Wallet, id: 'balance-fee' as Page },
    { name: 'Update Status Form', icon: ClipboardCheck, id: 'student-status' as Page },
    { name: 'Courier Status', icon: Truck, id: 'courier-status' as Page },
  ];

  return (
    <NavigationContext.Provider value={{ setCurrentPage }}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {currentPage !== 'appointment' && (
          <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
            {/* Main Menu Ribbon */}
            <div className="border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center gap-3">
                    <div className="leading-none">
                      <h1 className="text-xl font-bold text-gray-900 leading-none mb-0.5">Mirror Dashboard</h1>
                      <p className="text-xs font-semibold text-blue-600 leading-none">(ERP-CRM)</p>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-2">
                    {mainNavigation.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setCurrentPage(item.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                          currentPage === item.id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </button>
                    ))}

                    <div className="ml-4 flex items-center gap-2 pl-4 border-l border-gray-300">
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{profile?.full_name}</span>
                      </div>
                      <button
                        onClick={signOut}
                        className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Sign Out"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                  >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Forms Ribbon */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="hidden md:flex items-center gap-2 py-3 overflow-x-auto">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2">Forms:</span>
                  {formsNavigation.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentPage(item.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition whitespace-nowrap ${
                        currentPage === item.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-300'
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
              <div className="md:hidden border-t border-gray-200 bg-white">
                <div className="px-4 py-3 space-y-2">
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Main Menu</p>
                    {mainNavigation.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentPage(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition ${
                          currentPage === item.id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </button>
                    ))}
                  </div>

                  <div className="mb-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Forms</p>
                    {formsNavigation.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentPage(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition ${
                          currentPage === item.id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2 px-4 py-2 mb-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">{profile?.full_name}</span>
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </nav>
        )}

      {currentPage === 'appointment' ? (
        <AppointmentBooking />
      ) : (
        <>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {currentPage === 'dashboard' && <Dashboard />}
            {currentPage === 'enquiry' && <EnquiryForm />}
            {currentPage === 'support' && <SupportForm />}
            {currentPage === 'admission' && <AdmissionForm />}
            {currentPage === 'balance-fee' && <BalanceFeePayment />}
            {currentPage === 'student-status' && <StudentStatusForm />}
            {currentPage === 'courier-status' && <CourierStatus />}
            {currentPage === 'status' && <StatusSearch />}
            {currentPage === 'admin' && <AdminPanel />}
          </main>

          <footer className="bg-white border-t border-gray-200 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <p className="text-center text-gray-600 text-sm">
                <span className="font-semibold text-gray-900">Mirror</span> <span className="text-xs">(ERP-CRM)</span> <span className="text-emerald-600 font-semibold">by Dr. Chetan</span> - All data is securely stored and interconnected
              </p>
            </div>
          </footer>
        </>
      )}
      </div>
    </NavigationContext.Provider>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        {import.meta.hot && <Login />}
        {!import.meta.hot && <Login />}
      </div>
    );
  }

  return <AppContent />;
}

export default App;
