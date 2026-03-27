import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Wallet, AlertCircle, CheckCircle, ArrowLeft, Search, Upload, FileText, ExternalLink, CreditCard as Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Contact, Admission, Payment } from '../types/interfaces';

export function BalanceFeePayment() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Admission[]>([]);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [searching, setSearching] = useState(false);
  const [previousPaymentCount, setPreviousPaymentCount] = useState<number>(0);
  const [previousPaymentDates, setPreviousPaymentDates] = useState<string[]>([]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingFees, setEditingFees] = useState(false);
  const [editedTotalFee, setEditedTotalFee] = useState(0);
  const [editedAmountPaid, setEditedAmountPaid] = useState(0);
  const [savingFees, setSavingFees] = useState(false);

  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    receiptDate: new Date().toISOString().split('T')[0],
    paymentMode: 'cash' as const,
    transactionNumber: '',
    notes: '',
    counselor: '',
  });

  const searchAdmissions = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const searchPattern = `%${query}%`;

      const { data: contacts, error: contactError } = await supabase
        .from('contacts')
        .select('id')
        .or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},email.ilike.${searchPattern},phone.ilike.${searchPattern}`)
        .limit(50);

      if (contactError) throw contactError;

      if (!contacts || contacts.length === 0) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      const contactIds = contacts.map(c => c.id);

      const { data: admissions, error: admissionError } = await supabase
        .from('admissions')
        .select(`
          id,
          contact_id,
          program,
          specialisation,
          amount,
          amount_paid,
          status,
          contacts (
            id,
            first_name,
            last_name,
            email,
            phone,
            mobile1,
            mobile2,
            date_of_birth,
            city
          )
        `)
        .in('contact_id', contactIds)
        .limit(20);

      if (admissionError) throw admissionError;
      setSearchResults((admissions as any) || []);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const loadPayments = async (admissionId: string) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('admission_id', admissionId)
        .order('payment_date', { ascending: false });

      if (error) throw error;

      setPayments(data || []);
      const total = (data || []).reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0);
      setTotalPaid(total);
    } catch (err) {
      console.error('Error loading payments:', err);
    }
  };

  const handleSelectAdmission = async (admission: Admission) => {
    setSelectedAdmission(admission);
    setSearchResults([]);
    setSearchQuery('');
    loadPayments(admission.id);
    setEditedTotalFee(admission.amount);
    setEditedAmountPaid(admission.amount_paid);
    await fetchPreviousPayments(admission.contact_id);
  };

  const fetchPreviousPayments = async (contactId: string) => {
    try {
      const { data: admissions, error: admissionsError } = await supabase
        .from('admissions')
        .select('id')
        .eq('contact_id', contactId);

      if (admissionsError) throw admissionsError;

      if (!admissions || admissions.length === 0) {
        setPreviousPaymentCount(0);
        setPreviousPaymentDates([]);
        return;
      }

      const admissionIds = admissions.map(a => a.id);

      const { data: allPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('id, payment_date')
        .in('admission_id', admissionIds)
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      setPreviousPaymentCount(allPayments?.length || 0);
      setPreviousPaymentDates(allPayments?.map(p => p.payment_date) || []);
    } catch (err) {
      console.error('Error fetching previous payments:', err);
      setPreviousPaymentCount(0);
      setPreviousPaymentDates([]);
    }
  };

  const startEditingFees = () => {
    if (selectedAdmission) {
      setEditedTotalFee(selectedAdmission.amount);
      setEditedAmountPaid(totalPaid);
      setEditingFees(true);
    }
  };

  const cancelEditingFees = () => {
    setEditingFees(false);
    setError('');
  };

  const saveFeeChanges = async () => {
    if (!selectedAdmission) return;

    if (editedAmountPaid > editedTotalFee) {
      setError('Amount Paid cannot exceed Total Fee');
      return;
    }

    if (editedTotalFee < 0 || editedAmountPaid < 0) {
      setError('Amounts cannot be negative');
      return;
    }

    setSavingFees(true);
    setError('');

    try {
      const newPaymentStatus =
        editedAmountPaid === 0 ? 'pending' :
        editedAmountPaid < editedTotalFee ? 'partial' :
        'completed';

      const { error: updateError } = await supabase
        .from('admissions')
        .update({
          amount: editedTotalFee,
          amount_paid: editedAmountPaid,
          payment_status: newPaymentStatus,
        })
        .eq('id', selectedAdmission.id);

      if (updateError) throw updateError;

      setSelectedAdmission({
        ...selectedAdmission,
        amount: editedTotalFee,
        amount_paid: editedAmountPaid,
      });
      setTotalPaid(editedAmountPaid);
      setEditingFees(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update fees');
    } finally {
      setSavingFees(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchAdmissions(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const uploadReceipt = async (paymentId: string): Promise<string | null> => {
    if (!receiptFile) return null;

    setUploading(true);
    try {
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${paymentId}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-receipts')
        .upload(filePath, receiptFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      return filePath;
    } catch (err) {
      console.error('File upload error:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedAdmission) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const newTotalPaid = totalPaid + paymentData.amount;

      if (newTotalPaid > selectedAdmission.amount) {
        setError('Payment amount exceeds the balance due');
        setLoading(false);
        return;
      }

      const tempPaymentId = crypto.randomUUID();
      let receiptFileUrl: string | null = null;

      if (receiptFile) {
        receiptFileUrl = await uploadReceipt(tempPaymentId);
      }

      const balanceAfterPayment = selectedAdmission.amount - newTotalPaid;

      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          id: tempPaymentId,
          admission_id: selectedAdmission.id,
          amount: paymentData.amount,
          payment_date: paymentData.paymentDate,
          receipt_date: paymentData.receiptDate || null,
          payment_mode: paymentData.paymentMode,
          transaction_number: paymentData.transactionNumber || null,
          notes: paymentData.notes || null,
          receipt_file_url: receiptFileUrl,
          balance_fee: balanceAfterPayment,
          counselor: paymentData.counselor || null,
        });

      if (paymentError) throw paymentError;

      const newPaymentStatus =
        newTotalPaid === 0 ? 'pending' :
        newTotalPaid < selectedAdmission.amount ? 'partial' :
        'completed';

      const { error: admissionError } = await supabase
        .from('admissions')
        .update({
          amount_paid: newTotalPaid,
          payment_status: newPaymentStatus,
        })
        .eq('id', selectedAdmission.id);

      if (admissionError) throw admissionError;

      setSuccess(true);
      setPaymentData({
        amount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        receiptDate: new Date().toISOString().split('T')[0],
        paymentMode: 'cash',
        transactionNumber: '',
        notes: '',
        counselor: '',
      });
      setReceiptFile(null);

      loadPayments(selectedAdmission.id);
      setSelectedAdmission({
        ...selectedAdmission,
        amount_paid: newTotalPaid,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const balance = selectedAdmission ? selectedAdmission.amount - totalPaid : 0;

  const downloadReceipt = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('payment-receipts')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'receipt.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading receipt:', err);
      setError('Failed to download receipt');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-lg">
            <Wallet className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Student Status</h2>
            <p className="text-gray-600">Record fee payments for admissions</p>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900">Payment recorded successfully!</p>
              <p className="text-sm text-green-700 mt-1">The payment has been added to the account.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-900">{error}</p>
          </div>
        )}

        {!selectedAdmission ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search for Student Admission
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {searching && (
              <p className="text-sm text-gray-600">Searching...</p>
            )}

            {searchResults.length > 0 && (
              <div className="border border-gray-200 rounded-lg divide-y">
                {searchResults.map((admission) => (
                  <button
                    key={admission.id}
                    onClick={() => handleSelectAdmission(admission)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {admission.contacts.first_name} {admission.contacts.last_name}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          <p className="text-sm text-gray-600">{admission.contacts.email}</p>
                          {admission.contacts.phone && (
                            <p className="text-sm text-gray-600">{admission.contacts.phone}</p>
                          )}
                          {admission.contacts.mobile1 && (
                            <p className="text-sm text-gray-600">{admission.contacts.mobile1}</p>
                          )}
                          {admission.contacts.mobile2 && (
                            <p className="text-sm text-gray-600">{admission.contacts.mobile2}</p>
                          )}
                          {admission.contacts.city && (
                            <p className="text-sm text-gray-500">{admission.contacts.city}</p>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {admission.program} {admission.specialisation ? `- ${admission.specialisation}` : ''}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          ID: {admission.id.substring(0, 8)}...
                        </p>
                      </div>
                      <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full whitespace-nowrap ml-2">
                        Select
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedAdmission.contacts.first_name} {selectedAdmission.contacts.last_name}
                </h3>
                <p className="text-sm text-gray-600">{selectedAdmission.contacts.email}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedAdmission(null);
                  setPayments([]);
                  setTotalPaid(0);
                }}
                className="text-sm text-gray-600 hover:text-gray-900 transition"
              >
                Change Student
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Program Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Program
                  </label>
                  <p className="text-gray-900">{selectedAdmission.program}</p>
                </div>
                {selectedAdmission.specialisation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialisation
                    </label>
                    <p className="text-gray-900">{selectedAdmission.specialisation}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>

              {previousPaymentCount > 0 && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-900 flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Multiple Entries: {previousPaymentCount} previous payment{previousPaymentCount === 1 ? '' : 's'}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Earlier payment dates: {previousPaymentDates.slice(0, 5).map(d => new Date(d).toLocaleDateString()).join(', ')}
                    {previousPaymentDates.length > 5 && ` and ${previousPaymentDates.length - 5} more`}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <p className="text-gray-900">
                    {selectedAdmission.contacts.first_name} {selectedAdmission.contacts.last_name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{selectedAdmission.contacts.email}</p>
                </div>
                {selectedAdmission.contacts.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <p className="text-gray-900">{selectedAdmission.contacts.phone}</p>
                  </div>
                )}
                {selectedAdmission.contacts.mobile1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile 1
                    </label>
                    <p className="text-gray-900">{selectedAdmission.contacts.mobile1}</p>
                  </div>
                )}
                {selectedAdmission.contacts.mobile2 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile 2
                    </label>
                    <p className="text-gray-900">{selectedAdmission.contacts.mobile2}</p>
                  </div>
                )}
                {selectedAdmission.contacts.city && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <p className="text-gray-900">{selectedAdmission.contacts.city}</p>
                  </div>
                )}
                {selectedAdmission.contacts.date_of_birth && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedAdmission.contacts.date_of_birth).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Payment Information</h3>
                {isAdmin && !editingFees && (
                  <button
                    onClick={startEditingFees}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Fees
                  </button>
                )}
                {editingFees && (
                  <div className="flex gap-2">
                    <button
                      onClick={saveFeeChanges}
                      disabled={savingFees}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {savingFees ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={cancelEditingFees}
                      disabled={savingFees}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Fee
                  </label>
                  {editingFees ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editedTotalFee}
                      onChange={(e) => setEditedTotalFee(parseFloat(e.target.value) || 0)}
                      className="w-full text-2xl font-bold text-gray-900 border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{selectedAdmission.amount.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount Paid
                  </label>
                  {editingFees ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editedAmountPaid}
                      onChange={(e) => setEditedAmountPaid(parseFloat(e.target.value) || 0)}
                      className="w-full text-2xl font-bold text-green-600 border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-green-600">
                      ₹{totalPaid.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fee Balance
                  </label>
                  <p className="text-2xl font-bold text-amber-600">
                    ₹{editingFees ? (editedTotalFee - editedAmountPaid).toLocaleString() : balance.toLocaleString()}
                  </p>
                </div>
              </div>

              {payments.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Payment History</h4>
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="bg-white p-4 rounded-lg border border-gray-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <p className="font-medium text-gray-900">
                                ₹{parseFloat(payment.amount.toString()).toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(payment.payment_date).toLocaleDateString()}
                              </p>
                              {payment.balance_fee !== null && (
                                <span className="text-sm text-amber-600 font-medium">
                                  Balance: ₹{parseFloat(payment.balance_fee.toString()).toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-4 text-sm text-gray-600 flex-wrap">
                              <span className="capitalize">{payment.payment_mode.replace('_', ' ')}</span>
                              {payment.transaction_number && (
                                <span>Txn: {payment.transaction_number}</span>
                              )}
                              {payment.receipt_date && (
                                <span>Receipt: {new Date(payment.receipt_date).toLocaleDateString()}</span>
                              )}
                              {payment.counselor && (
                                <span>Counselor: {payment.counselor}</span>
                              )}
                            </div>
                            {payment.notes && (
                              <p className="text-sm text-gray-500 mt-2">{payment.notes}</p>
                            )}
                            {payment.receipt_file_url && (
                              <button
                                onClick={() => downloadReceipt(payment.receipt_file_url!)}
                                className="flex items-center gap-2 mt-2 text-sm text-blue-600 hover:text-blue-700 transition"
                              >
                                <FileText className="w-4 h-4" />
                                Download Receipt
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {balance > 0 && (
              <form onSubmit={handleSubmit} className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Add New Payment</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Amount *
                      </label>
                      <input
                        type="number"
                        id="amount"
                        required
                        min="0.01"
                        max={balance}
                        step="0.01"
                        value={paymentData.amount || ''}
                        onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      />
                      <p className="text-xs text-gray-600 mt-1">Maximum: ₹{balance.toLocaleString()}</p>
                    </div>

                    <div>
                      <label htmlFor="counselor" className="block text-sm font-medium text-gray-700 mb-2">
                        Counselor
                      </label>
                      <input
                        type="text"
                        id="counselor"
                        value={paymentData.counselor}
                        onChange={(e) => setPaymentData({ ...paymentData, counselor: e.target.value })}
                        placeholder="Enter counselor name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Date *
                      </label>
                      <input
                        type="date"
                        id="paymentDate"
                        required
                        value={paymentData.paymentDate}
                        onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="receiptDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Receipt Date
                      </label>
                      <input
                        type="date"
                        id="receiptDate"
                        value={paymentData.receiptDate}
                        onChange={(e) => setPaymentData({ ...paymentData, receiptDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="paymentMode" className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Mode *
                      </label>
                      <select
                        id="paymentMode"
                        required
                        value={paymentData.paymentMode}
                        onChange={(e) => setPaymentData({ ...paymentData, paymentMode: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      >
                        <option value="cash">Cash</option>
                        <option value="cheque">Cheque</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                        <option value="net_banking">Net Banking</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="transactionNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction Number
                      </label>
                      <input
                        type="text"
                        id="transactionNumber"
                        value={paymentData.transactionNumber}
                        onChange={(e) => setPaymentData({ ...paymentData, transactionNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      value={paymentData.notes}
                      onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="receipt" className="block text-sm font-medium text-gray-700 mb-2">
                      Attach Receipt (PDF)
                    </label>
                    <div className="flex items-center gap-4">
                      <label
                        htmlFor="receipt"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                      >
                        <Upload className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700">
                          {receiptFile ? receiptFile.name : 'Choose PDF file'}
                        </span>
                      </label>
                      <input
                        type="file"
                        id="receipt"
                        accept="application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.type === 'application/pdf') {
                              setReceiptFile(file);
                            } else {
                              setError('Please select a PDF file');
                              e.target.value = '';
                            }
                          }
                        }}
                        className="hidden"
                      />
                      {receiptFile && (
                        <button
                          type="button"
                          onClick={() => setReceiptFile(null)}
                          className="text-sm text-red-600 hover:text-red-700 transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Optional: Upload a PDF receipt for this payment</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || uploading}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-5 h-5" />
                    {uploading ? 'Uploading Receipt...' : loading ? 'Recording Payment...' : 'Record Payment'}
                  </button>
                </div>
              </form>
            )}

            {balance === 0 && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-green-900 font-medium">All fees have been paid in full!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
