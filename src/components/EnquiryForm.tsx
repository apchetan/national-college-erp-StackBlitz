import { useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { ContactSearch } from './ContactSearch';
import { DuplicateWarningModal } from './DuplicateWarningModal';
import { EnquiryPersonalSection } from './enquiry/EnquiryPersonalSection';
import { EnquiryDetailsSection } from './enquiry/EnquiryDetailsSection';
import { useEnquiryForm } from '../hooks/useEnquiryForm';
import { LoadingSpinner } from './LoadingSpinner';
import { FormProgressIndicator } from './FormProgressIndicator';
import { RequiredFieldsProgress } from './RequiredFieldsProgress';

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
    errors,
    validateField,
    clearError,
    validationRules,
    fieldProgress,
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

        <FormProgressIndicator
          sections={[
            { id: 'contact-search', label: 'Contact Search' },
            { id: 'enquiry-details', label: 'Enquiry Details' },
            { id: 'personal-info', label: 'Personal Information' },
          ]}
        />

        <RequiredFieldsProgress
          completed={fieldProgress.completed}
          total={fieldProgress.total}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div id="contact-search">
            <ContactSearch
              onSelectContact={setSelectedContact}
              selectedContact={selectedContact}
            />
          </div>

          <div id="enquiry-details">
            <EnquiryDetailsSection
              formData={formData}
              setFormData={setFormData}
              handleProgramChange={handleProgramChange}
              handleHighestQualificationCourseChange={handleHighestQualificationCourseChange}
              shouldShowSpecialisation={shouldShowSpecialisation}
              getAvailableSpecialisations={getAvailableSpecialisations}
              errors={errors}
              validateField={validateField}
              clearError={clearError}
              validationRules={validationRules}
            />
          </div>

          <div id="personal-info">
            <EnquiryPersonalSection
              formData={formData}
              setFormData={setFormData}
              previousEnquiries={previousEnquiries}
              errors={errors}
              validateField={validateField}
              clearError={clearError}
              validationRules={validationRules}
            />
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 mt-6 md:relative md:border-0 md:p-0 md:mx-0 md:mt-6 md:bg-transparent">
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
                {loading ? (
                  <>
                    <LoadingSpinner variant="inline" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Submit Enquiry
                  </>
                )}
              </button>
            </div>
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
