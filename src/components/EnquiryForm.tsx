import { useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { ContactSearch } from './ContactSearch';
import { DuplicateWarningModal } from './DuplicateWarningModal';
import { EnquiryPersonalSection } from './enquiry/EnquiryPersonalSection';
import { EnquiryDetailsSection } from './enquiry/EnquiryDetailsSection';
import { useEnquiryForm } from '../hooks/useEnquiryForm';

export function EnquiryForm() {
  const navigate = useNavigate();
  const {
    formData,
    setFormData,
    loading,
    success,
    error,
    selectedContact,
    setSelectedContact,
    previousEnquiries,
    potentialDuplicates,
    handleSubmit,
    handleProgramChange,
    handleHighestQualificationCourseChange,
    shouldShowSpecialisation,
    getAvailableSpecialisations,
    handleClearForm,
    handleUseExisting,
    handleCreateNew,
    handleCancelDuplicate,
  } = useEnquiryForm();

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Enquiry Form</h2>
            <p className="text-gray-600">Send us your questions or inquiries</p>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900">Enquiry submitted successfully!</p>
              <p className="text-sm text-green-700 mt-1">We'll get back to you shortly.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-900">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <ContactSearch
            onSelectContact={setSelectedContact}
            selectedContact={selectedContact}
          />

          <EnquiryDetailsSection
            formData={formData}
            setFormData={setFormData}
            handleProgramChange={handleProgramChange}
            handleHighestQualificationCourseChange={handleHighestQualificationCourseChange}
            shouldShowSpecialisation={shouldShowSpecialisation}
            getAvailableSpecialisations={getAvailableSpecialisations}
          />

          <EnquiryPersonalSection
            formData={formData}
            setFormData={setFormData}
            previousEnquiries={previousEnquiries}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleClearForm}
              className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition flex items-center justify-center gap-2"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              {loading ? 'Submitting...' : 'Submit Enquiry'}
            </button>
          </div>
        </form>
      </div>

      {potentialDuplicates.length > 0 && (
        <DuplicateWarningModal
          duplicates={potentialDuplicates}
          onUseExisting={handleUseExisting}
          onCreateNew={handleCreateNew}
          onCancel={handleCancelDuplicate}
        />
      )}
    </div>
  );
}
