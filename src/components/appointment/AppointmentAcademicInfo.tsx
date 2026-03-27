import { Briefcase } from 'lucide-react';
import { PROGRAMS, QUALIFICATIONS, EMPLOYMENT_STATUS, generateYears } from '../../constants/formOptions';

interface FormData {
  fullName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  city: string;
  state: string;
  program: string;
  specialization: string;
  highestQualification: string;
  highestQualificationCourse: string;
  highestQualificationSpecialization: string;
  yearOfPassing: string;
  totalExperience: string;
  employmentStatus: string;
  appointmentType: string;
  preferredDate: string;
  timeSlot: string;
}

interface AppointmentAcademicInfoProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  getAvailableSpecialisations: () => string[];
  handleHighestQualificationCourseChange: (course: string) => void;
  shouldShowHighestQualificationSpecialisation: () => boolean;
  getAvailableHighestQualificationSpecialisations: () => string[];
}

export function AppointmentAcademicInfo({
  formData,
  setFormData,
  getAvailableSpecialisations,
  handleHighestQualificationCourseChange,
  shouldShowHighestQualificationSpecialisation,
  getAvailableHighestQualificationSpecialisations,
}: AppointmentAcademicInfoProps) {
  return (
    <>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Program Details</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-2">
                Course Interested <span className="text-red-500">*</span>
              </label>
              <select
                id="program"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value, specialization: '' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Select a course</option>
                {PROGRAMS.map(program => (
                  <option key={program.id} value={program.id}>{program.name}</option>
                ))}
              </select>
            </div>

            {formData.program && getAvailableSpecialisations().length > 0 && (
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <select
                  id="specialization"
                  disabled={!formData.program}
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {formData.program ? 'Select specialization' : 'Select a course first'}
                  </option>
                  {getAvailableSpecialisations().map(spec => (
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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

          {shouldShowHighestQualificationSpecialisation() && (
            <div>
              <label htmlFor="highestQualificationSpecialization" className="block text-sm font-medium text-gray-700 mb-2">
                Specialisation
              </label>
              <select
                id="highestQualificationSpecialization"
                disabled={!formData.highestQualificationCourse}
                value={formData.highestQualificationSpecialization}
                onChange={(e) => setFormData({ ...formData, highestQualificationSpecialization: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {formData.highestQualificationCourse ? 'Select specialisation' : 'Select a course first'}
                </option>
                {getAvailableHighestQualificationSpecialisations().map((spec) => (
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="">Select your employment status</option>
            {EMPLOYMENT_STATUS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
