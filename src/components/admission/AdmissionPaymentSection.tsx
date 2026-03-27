import { Upload, FileText } from 'lucide-react';

interface FormData {
  fullName: string;
  mobile: string;
  mobile1: string;
  mobile2: string;
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
  resume: File | null;
  idProof: File | null;
  certificates: File | null;
}

interface AdmissionPaymentSectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

export function AdmissionPaymentSection({ formData, setFormData }: AdmissionPaymentSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amber-100 rounded-lg">
          <Upload className="w-6 h-6 text-amber-900" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Upload Documents</h3>
          <p className="text-sm text-gray-600 mt-1">Optional - You can upload these later</p>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { id: 'resume', label: 'Resume / CV', accept: '.pdf,.doc,.docx' },
          { id: 'idProof', label: 'ID Proof (Aadhar/PAN/Passport)', accept: '.pdf,.jpg,.jpeg,.png' },
          { id: 'certificates', label: 'Educational Certificates', accept: '.pdf,.jpg,.jpeg,.png' }
        ].map(doc => (
          <div key={doc.id} className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-amber-400 transition">
            <label htmlFor={doc.id} className="cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{doc.label}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData[doc.id as keyof FormData] ?
                      (formData[doc.id as keyof FormData] as File).name :
                      `Click to upload or drag and drop`}
                  </p>
                </div>
                <Upload className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="file"
                id={doc.id}
                accept={doc.accept}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setFormData({ ...formData, [doc.id]: file });
                }}
                className="hidden"
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
