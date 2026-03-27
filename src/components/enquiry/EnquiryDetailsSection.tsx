import { Briefcase } from 'lucide-react';
import { QUALIFICATIONS, EMPLOYMENT_STATUS, generateYears } from '../../constants/formOptions';
import { ValidatedInput, ValidatedTextarea } from '../ValidatedInput';
import { ValidationRule } from '../../hooks/useFormValidation';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mobile1: string;
  mobile2: string;
  dateOfBirth: string;
  city: string;
  company: string;
  source: string;
  program: string;
  specialisation: string;
  subject: string;
  message: string;
  highestQualification: string;
  highestQualificationCourse: string;
  highestQualificationSpecialization: string;
  yearOfPassing: string;
  totalExperience: string;
  employmentStatus: string;
}

interface EnquiryDetailsSectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  handleProgramChange: (program: string) => void;
  handleHighestQualificationCourseChange: (course: string) => void;
  shouldShowSpecialisation: (course: string) => boolean;
  getAvailableSpecialisations: (course: string) => string[];
  errors?: Record<string, string>;
  validateField?: (fieldName: string, value: any, rules: ValidationRule) => boolean;
  clearError?: (fieldName: string) => void;
  validationRules?: Record<string, ValidationRule>;
}

export function EnquiryDetailsSection({
  formData,
  setFormData,
  handleProgramChange,
  handleHighestQualificationCourseChange,
  shouldShowSpecialisation,
  getAvailableSpecialisations,
  errors = {},
  validateField,
  clearError,
  validationRules = {}
}: EnquiryDetailsSectionProps) {
  return (
    <>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Program Details</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-2">
                Course Interested
              </label>
              <select
                id="program"
                value={formData.program}
                onChange={(e) => handleProgramChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Select a course</option>
                <option value="PhD">PhD</option>
                <option value="BTech">BTech</option>
                <option value="MBA">MBA</option>
                <option value="MCA">MCA</option>
                <option value="MSc">MSc</option>
                <option value="MTech">MTech</option>
                <option value="Diploma Engg.">Diploma Engg.</option>
                <option value="LLB">LLB</option>
                <option value="LLM">LLM</option>
                <option value="BSc">BSc</option>
                <option value="BBA">BBA</option>
                <option value="BCA">BCA</option>
                <option value="BCom">BCom</option>
                <option value="BA">BA</option>
                <option value="BEd">BEd</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            {shouldShowSpecialisation(formData.program) && (
              <div>
                <label htmlFor="specialisation" className="block text-sm font-medium text-gray-700 mb-2">
                  Specialisation
                </label>
                <select
                  id="specialisation"
                  disabled={!formData.program}
                  value={formData.specialisation}
                  onChange={(e) => setFormData({ ...formData, specialisation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {formData.program ? 'Select specialisation' : 'Select a course first'}
                  </option>
                  {getAvailableSpecialisations(formData.program).map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Briefcase className="w-6 h-6 text-blue-900" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Educational & Professional Background</h3>
        </div>

        <div>
          <label htmlFor="highestQualification" className="block text-sm font-medium text-gray-700 mb-2">
            Highest Qualification <span className="text-red-500">*</span>
          </label>
          <select
            id="highestQualification"
            value={formData.highestQualification}
            onChange={(e) => setFormData({ ...formData, highestQualification: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="">Select your highest qualification</option>
            {QUALIFICATIONS.map(qual => (
              <option key={qual} value={qual}>{qual}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="highestQualificationCourse" className="block text-sm font-medium text-gray-700 mb-2">
              Course
            </label>
            <select
              id="highestQualificationCourse"
              value={formData.highestQualificationCourse}
              onChange={(e) => handleHighestQualificationCourseChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="">Select a course</option>
              <option value="10th">10th</option>
              <option value="12th">12th</option>
              <option value="BA">BA</option>
              <option value="BBA">BBA</option>
              <option value="BCA">BCA</option>
              <option value="BCom">BCom</option>
              <option value="BEd">BEd</option>
              <option value="BSc">BSc</option>
              <option value="BTech">BTech</option>
              <option value="Diploma Engg.">Diploma Engg.</option>
              <option value="LLB">LLB</option>
              <option value="LLM">LLM</option>
              <option value="MBA">MBA</option>
              <option value="MCA">MCA</option>
              <option value="MSc">MSc</option>
              <option value="MTech">MTech</option>
              <option value="PhD">PhD</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          {shouldShowSpecialisation(formData.highestQualificationCourse) && (
            <div>
              <label htmlFor="highestQualificationSpecialization" className="block text-sm font-medium text-gray-700 mb-2">
                Specialisation
              </label>
              <select
                id="highestQualificationSpecialization"
                disabled={!formData.highestQualificationCourse}
                value={formData.highestQualificationSpecialization}
                onChange={(e) => setFormData({ ...formData, highestQualificationSpecialization: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {formData.highestQualificationCourse ? 'Select specialisation' : 'Select a course first'}
                </option>
                {getAvailableSpecialisations(formData.highestQualificationCourse).map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="yearOfPassing" className="block text-sm font-medium text-gray-700 mb-2">
            Year of Passing <span className="text-red-500">*</span>
          </label>
          <select
            id="yearOfPassing"
            value={formData.yearOfPassing}
            onChange={(e) => setFormData({ ...formData, yearOfPassing: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="">Select year of passing</option>
            {generateYears().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="totalExperience" className="block text-sm font-medium text-gray-700 mb-2">
            Total Experience
          </label>
          <select
            id="totalExperience"
            value={formData.totalExperience}
            onChange={(e) => setFormData({ ...formData, totalExperience: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="">Select years of experience</option>
            {Array.from({ length: 51 }, (_, i) => i).map(years => (
              <option key={years} value={years}>{years} {years === 1 ? 'year' : 'years'}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="employmentStatus" className="block text-sm font-medium text-gray-700 mb-2">
            Current Employment Status <span className="text-red-500">*</span>
          </label>
          <select
            id="employmentStatus"
            value={formData.employmentStatus}
            onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="">Select your employment status</option>
            {EMPLOYMENT_STATUS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Enquiry Details</h3>
        <div className="space-y-4">
          <ValidatedInput
            label="Subject"
            name="subject"
            type="text"
            required
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            onFocus={() => clearError?.('subject')}
            onBlur={() => validateField?.('subject', formData.subject, validationRules.subject || {})}
            error={errors.subject}
            placeholder="What is your enquiry about?"
          />

          <ValidatedTextarea
            label="Message"
            name="message"
            required
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            onFocus={() => clearError?.('message')}
            onBlur={() => validateField?.('message', formData.message, validationRules.message || {})}
            error={errors.message}
            placeholder="Please provide details about your enquiry..."
          />
        </div>
      </div>
    </>
  );
}
