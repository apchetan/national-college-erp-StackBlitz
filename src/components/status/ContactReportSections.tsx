import { FileText, Calendar, DollarSign, ClipboardCheck, Trash2, Award, BookOpen, CheckCircle } from 'lucide-react';
import { ContactReport } from '../../types/interfaces';

interface ContactReportSectionsProps {
  report: ContactReport;
  getCreatorName: (createdBy?: string) => string;
  toggleSelection: (type: 'enquiry' | 'appointment' | 'admission' | 'studentStatus', id: string) => void;
  selectedEnquiries: Set<string>;
  selectedAppointments: Set<string>;
  selectedAdmissions: Set<string>;
  selectedStudentStatuses: Set<string>;
  selectAllForContact: (report: ContactReport, type: 'enquiry' | 'appointment' | 'admission' | 'studentStatus') => void;
  confirmDelete: (type: string, ids: string[]) => void;
  getStatusBadgeColor: (status: string) => string;
}

export function ContactReportSections({
  report,
  getCreatorName,
  toggleSelection,
  selectedEnquiries,
  selectedAppointments,
  selectedAdmissions,
  selectedStudentStatuses,
  selectAllForContact,
  confirmDelete,
  getStatusBadgeColor
}: ContactReportSectionsProps) {
  return (
    <div className="p-6 space-y-6">
      {report.enquiries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Enquiry Forms ({report.enquiries.length})
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => selectAllForContact(report, 'enquiry')}
                className="text-sm px-3 py-1 text-green-700 bg-green-50 hover:bg-green-100 rounded transition"
              >
                Select All
              </button>
              {report.enquiries.filter(e => selectedEnquiries.has(e.id)).length > 0 && (
                <button
                  onClick={() => confirmDelete('enquiries', report.enquiries.filter(e => selectedEnquiries.has(e.id)).map(e => e.id))}
                  className="text-sm px-3 py-1 text-red-700 bg-red-50 hover:bg-red-100 rounded flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete Selected ({report.enquiries.filter(e => selectedEnquiries.has(e.id)).length})
                </button>
              )}
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg bg-gray-50">
            {report.enquiries.map((enquiry, idx) => (
              <div key={enquiry.id} className={`p-4 ${idx > 0 ? 'border-t border-gray-300' : ''}`}>
                <div className="flex gap-3">
                  <input
                    type="checkbox"
                    checked={selectedEnquiries.has(enquiry.id)}
                    onChange={() => toggleSelection('enquiry', enquiry.id)}
                    className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(enquiry.status)}`}>
                        {enquiry.status}
                      </span>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {new Date(enquiry.created_at).toLocaleDateString()} {new Date(enquiry.created_at).toLocaleTimeString()}
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          {getCreatorName(enquiry.created_by)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {enquiry.subject && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Subject:</span>
                          <p className="text-gray-600 mt-1">{enquiry.subject}</p>
                        </div>
                      )}
                      {enquiry.enquiry_type && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Type:</span>
                          <p className="text-gray-600 mt-1 capitalize">{enquiry.enquiry_type}</p>
                        </div>
                      )}
                      {enquiry.priority && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Priority:</span>
                          <p className="text-gray-600 mt-1 capitalize">{enquiry.priority}</p>
                        </div>
                      )}
                      {enquiry.date_of_application && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Application Date:</span>
                          <p className="text-gray-600 mt-1">{new Date(enquiry.date_of_application).toLocaleDateString()}</p>
                        </div>
                      )}
                      {enquiry.job_title && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Job Title:</span>
                          <p className="text-gray-600 mt-1">{enquiry.job_title}</p>
                        </div>
                      )}
                      {enquiry.current_company_name && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Current Company:</span>
                          <p className="text-gray-600 mt-1">{enquiry.current_company_name}</p>
                        </div>
                      )}
                      {enquiry.current_company_designation && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Designation:</span>
                          <p className="text-gray-600 mt-1">{enquiry.current_company_designation}</p>
                        </div>
                      )}
                      {enquiry.department && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Department:</span>
                          <p className="text-gray-600 mt-1">{enquiry.department}</p>
                        </div>
                      )}
                      {enquiry.role && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Role:</span>
                          <p className="text-gray-600 mt-1">{enquiry.role}</p>
                        </div>
                      )}
                      {enquiry.industry && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Industry:</span>
                          <p className="text-gray-600 mt-1">{enquiry.industry}</p>
                        </div>
                      )}
                      {enquiry.total_experience && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Experience:</span>
                          <p className="text-gray-600 mt-1">{enquiry.total_experience}</p>
                        </div>
                      )}
                      {enquiry.annual_salary && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Annual Salary:</span>
                          <p className="text-gray-600 mt-1 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ₹{enquiry.annual_salary.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {enquiry.notice_period && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Notice Period:</span>
                          <p className="text-gray-600 mt-1">{enquiry.notice_period}</p>
                        </div>
                      )}
                      {enquiry.current_location && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Current Location:</span>
                          <p className="text-gray-600 mt-1">{enquiry.current_location}</p>
                        </div>
                      )}
                      {enquiry.hometown && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Hometown:</span>
                          <p className="text-gray-600 mt-1">{enquiry.hometown}</p>
                        </div>
                      )}
                      {enquiry.pin_code && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Pin Code:</span>
                          <p className="text-gray-600 mt-1">{enquiry.pin_code}</p>
                        </div>
                      )}
                      {enquiry.gender && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Gender:</span>
                          <p className="text-gray-600 mt-1 capitalize">{enquiry.gender}</p>
                        </div>
                      )}
                      {enquiry.marital_status && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Marital Status:</span>
                          <p className="text-gray-600 mt-1 capitalize">{enquiry.marital_status}</p>
                        </div>
                      )}
                      {enquiry.work_permit_usa !== null && enquiry.work_permit_usa !== undefined && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">US Work Permit:</span>
                          <p className="text-gray-600 mt-1">{enquiry.work_permit_usa ? 'Yes' : 'No'}</p>
                        </div>
                      )}
                    </div>

                    {(enquiry.ug_degree || enquiry.pg_degree || enquiry.doctorate_degree) && (
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Award className="w-4 h-4 text-blue-600" />
                          Education
                        </h5>
                        <div className="space-y-3">
                          {enquiry.ug_degree && (
                            <div className="text-sm bg-white p-3 rounded">
                              <span className="font-semibold text-gray-700">UG:</span>
                              <p className="text-gray-600 mt-1">
                                {enquiry.ug_degree}
                                {enquiry.ug_specialization && ` - ${enquiry.ug_specialization}`}
                                {enquiry.ug_institute && ` | ${enquiry.ug_institute}`}
                                {enquiry.ug_graduation_year && ` (${enquiry.ug_graduation_year})`}
                              </p>
                            </div>
                          )}
                          {enquiry.pg_degree && (
                            <div className="text-sm bg-white p-3 rounded">
                              <span className="font-semibold text-gray-700">PG:</span>
                              <p className="text-gray-600 mt-1">
                                {enquiry.pg_degree}
                                {enquiry.pg_specialization && ` - ${enquiry.pg_specialization}`}
                                {enquiry.pg_institute && ` | ${enquiry.pg_institute}`}
                                {enquiry.pg_graduation_year && ` (${enquiry.pg_graduation_year})`}
                              </p>
                            </div>
                          )}
                          {enquiry.doctorate_degree && (
                            <div className="text-sm bg-white p-3 rounded">
                              <span className="font-semibold text-gray-700">Doctorate:</span>
                              <p className="text-gray-600 mt-1">
                                {enquiry.doctorate_degree}
                                {enquiry.doctorate_specialization && ` - ${enquiry.doctorate_specialization}`}
                                {enquiry.doctorate_institute && ` | ${enquiry.doctorate_institute}`}
                                {enquiry.doctorate_graduation_year && ` (${enquiry.doctorate_graduation_year})`}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {enquiry.key_skills && enquiry.key_skills.length > 0 && (
                      <div className="mt-4 text-sm">
                        <span className="font-semibold text-gray-700">Key Skills:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {enquiry.key_skills.map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {enquiry.preferred_locations && enquiry.preferred_locations.length > 0 && (
                      <div className="mt-4 text-sm">
                        <span className="font-semibold text-gray-700">Preferred Locations:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {enquiry.preferred_locations.map((location, idx) => (
                            <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                              {location}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {enquiry.resume_headline && (
                      <div className="mt-4 text-sm">
                        <span className="font-semibold text-gray-700">Resume Headline:</span>
                        <p className="text-gray-600 mt-1 bg-white p-3 rounded">{enquiry.resume_headline}</p>
                      </div>
                    )}
                    {enquiry.summary && (
                      <div className="mt-4 text-sm">
                        <span className="font-semibold text-gray-700">Summary:</span>
                        <p className="text-gray-600 mt-1 bg-white p-3 rounded">{enquiry.summary}</p>
                      </div>
                    )}
                    {enquiry.message && (
                      <div className="mt-4 text-sm">
                        <span className="font-semibold text-gray-700">Message:</span>
                        <p className="text-gray-600 mt-1 bg-white p-3 rounded">{enquiry.message}</p>
                      </div>
                    )}
                    {enquiry.permanent_address && (
                      <div className="mt-4 text-sm">
                        <span className="font-semibold text-gray-700">Permanent Address:</span>
                        <p className="text-gray-600 mt-1 bg-white p-3 rounded">{enquiry.permanent_address}</p>
                      </div>
                    )}

                    {(enquiry.phd_regular_while_working || enquiry.phd_area_of_interest || enquiry.looking_for || enquiry.attend_phd_webinar) && (
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                          PhD Information
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {enquiry.phd_regular_while_working && (
                            <div className="text-sm">
                              <span className="font-semibold text-gray-700">PhD Regular While Working:</span>
                              <p className="text-gray-600 mt-1">{enquiry.phd_regular_while_working}</p>
                            </div>
                          )}
                          {enquiry.phd_area_of_interest && (
                            <div className="text-sm">
                              <span className="font-semibold text-gray-700">Area of Interest:</span>
                              <p className="text-gray-600 mt-1">{enquiry.phd_area_of_interest}</p>
                            </div>
                          )}
                          {enquiry.looking_for && (
                            <div className="text-sm">
                              <span className="font-semibold text-gray-700">Looking For:</span>
                              <p className="text-gray-600 mt-1">{enquiry.looking_for}</p>
                            </div>
                          )}
                          {enquiry.attend_phd_webinar && (
                            <div className="text-sm">
                              <span className="font-semibold text-gray-700">Attend PhD Webinar:</span>
                              <p className="text-gray-600 mt-1">{enquiry.attend_phd_webinar}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.appointments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Appointments ({report.appointments.length})
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => selectAllForContact(report, 'appointment')}
                className="text-sm px-3 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition"
              >
                Select All
              </button>
              {report.appointments.filter(a => selectedAppointments.has(a.id)).length > 0 && (
                <button
                  onClick={() => confirmDelete('appointments', report.appointments.filter(a => selectedAppointments.has(a.id)).map(a => a.id))}
                  className="text-sm px-3 py-1 text-red-700 bg-red-50 hover:bg-red-100 rounded flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete Selected ({report.appointments.filter(a => selectedAppointments.has(a.id)).length})
                </button>
              )}
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg bg-blue-50">
            {report.appointments.map((appointment, idx) => (
              <div key={appointment.id} className={`p-4 ${idx > 0 ? 'border-t border-gray-300' : ''}`}>
                <div className="flex gap-3">
                  <input
                    type="checkbox"
                    checked={selectedAppointments.has(appointment.id)}
                    onChange={() => toggleSelection('appointment', appointment.id)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          Created: {new Date(appointment.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-blue-600 font-medium">
                          {getCreatorName(appointment.created_by)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-sm">
                        <span className="font-semibold text-gray-700">Title:</span>
                        <p className="text-gray-600 mt-1">{appointment.title}</p>
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold text-gray-700">Date & Time:</span>
                        <p className="text-gray-600 mt-1">
                          {new Date(appointment.appointment_date).toLocaleDateString()} at {new Date(appointment.appointment_date).toLocaleTimeString()}
                        </p>
                      </div>
                      {appointment.appointment_type && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Type:</span>
                          <p className="text-gray-600 mt-1 capitalize">{appointment.appointment_type}</p>
                        </div>
                      )}
                      {appointment.duration_minutes && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Duration:</span>
                          <p className="text-gray-600 mt-1">{appointment.duration_minutes} minutes</p>
                        </div>
                      )}
                      {appointment.location && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Location:</span>
                          <p className="text-gray-600 mt-1">{appointment.location}</p>
                        </div>
                      )}
                    </div>

                    {appointment.description && (
                      <div className="mt-4 text-sm">
                        <span className="font-semibold text-gray-700">Description:</span>
                        <p className="text-gray-600 mt-1 bg-white p-3 rounded">{appointment.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.admissions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              Fee Status ({report.admissions.length})
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => selectAllForContact(report, 'admission')}
                className="text-sm px-3 py-1 text-orange-700 bg-orange-50 hover:bg-orange-100 rounded transition"
              >
                Select All
              </button>
              {report.admissions.filter(a => selectedAdmissions.has(a.id)).length > 0 && (
                <button
                  onClick={() => confirmDelete('admissions', report.admissions.filter(a => selectedAdmissions.has(a.id)).map(a => a.id))}
                  className="text-sm px-3 py-1 text-red-700 bg-red-50 hover:bg-red-100 rounded flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete Selected ({report.admissions.filter(a => selectedAdmissions.has(a.id)).length})
                </button>
              )}
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg bg-orange-50">
            {report.admissions.map((admission, idx) => {
              return (
                <div key={admission.id} className={`p-4 ${idx > 0 ? 'border-t border-gray-300' : ''}`}>
                  <div className="flex gap-3">
                    <input
                      type="checkbox"
                      checked={selectedAdmissions.has(admission.id)}
                      onChange={() => toggleSelection('admission', admission.id)}
                      className="mt-1 w-4 h-4 text-orange-600 rounded focus:ring-orange-500 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(admission.status)}`}>
                          {admission.status}
                        </span>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            Created: {new Date(admission.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-orange-600 font-medium">
                            {getCreatorName(admission.created_by)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="text-sm">
                              <span className="font-semibold text-gray-700">Program:</span>
                              <p className="text-gray-600 mt-1 font-medium">{admission.program}</p>
                            </div>
                            {admission.amount && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Total Amount:</span>
                                <p className="text-gray-600 mt-1">₹{admission.amount.toLocaleString()}</p>
                              </div>
                            )}
                            {admission.previous_institution && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Previous Institution:</span>
                                <p className="text-gray-600 mt-1">{admission.previous_institution}</p>
                              </div>
                            )}
                            {admission.specialisation && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Specialisation:</span>
                                <p className="text-gray-600 mt-1">{admission.specialisation}</p>
                              </div>
                            )}
                            {admission.amount_paid && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Amount Paid:</span>
                                <p className="text-gray-600 mt-1">₹{admission.amount_paid.toLocaleString()}</p>
                              </div>
                            )}
                            {admission.payment_status && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Payment Status:</span>
                                <p className="text-gray-600 mt-1 capitalize">{admission.payment_status}</p>
                              </div>
                            )}
                            {admission.amount && admission.amount_paid !== null && admission.amount_paid !== undefined && (
                              <div className="text-sm">
                                <span className="font-semibold text-gray-700">Balance Fee:</span>
                                <p className="text-gray-600 mt-1 font-bold text-orange-700">₹{(admission.amount - admission.amount_paid).toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="lg:col-span-1">
                          <div className="bg-white rounded-lg p-3 border border-orange-200 h-full">
                            <h5 className="font-semibold text-gray-900 mb-3 text-sm">Payment History</h5>
                            {(() => {
                              const admissionPayments = report.payments.filter(p => p.admission_id === admission.id);
                              if (admissionPayments.length === 0) {
                                return <p className="text-xs text-gray-500">No payments recorded</p>;
                              }
                              return (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {admissionPayments.map((payment) => (
                                    <div key={payment.id} className="text-xs bg-orange-50 p-2 rounded border border-orange-100">
                                      <div className="flex justify-between items-start mb-1">
                                        <span className="font-semibold text-orange-900">₹{payment.amount.toLocaleString()}</span>
                                        <span className="text-gray-500">{new Date(payment.payment_date).toLocaleDateString()}</span>
                                      </div>
                                      <div className="text-gray-600 capitalize">{payment.payment_mode}</div>
                                      {payment.transaction_number && (
                                        <div className="text-gray-500 truncate">Txn: {payment.transaction_number}</div>
                                      )}
                                      {payment.created_by && (
                                        <div className="text-orange-600 font-medium mt-1">
                                          {getCreatorName(payment.created_by)}
                                        </div>
                                      )}
                                      {payment.notes && (
                                        <div className="text-gray-600 mt-1 text-xs">{payment.notes}</div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      {admission.qualification && (
                        <div className="mt-4 text-sm">
                          <span className="font-semibold text-gray-700">Qualification:</span>
                          <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                            {admission.qualification}
                          </span>
                        </div>
                      )}

                      {admission.notes && (
                        <div className="mt-4 text-sm">
                          <span className="font-semibold text-gray-700">Admission Notes:</span>
                          <p className="text-gray-600 mt-1 bg-white p-3 rounded">{admission.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {report.studentStatuses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-indigo-600" />
              Student Status ({report.studentStatuses.length})
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => selectAllForContact(report, 'studentStatus')}
                className="text-sm px-3 py-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded transition"
              >
                Select All
              </button>
              {report.studentStatuses.filter(s => selectedStudentStatuses.has(s.id)).length > 0 && (
                <button
                  onClick={() => confirmDelete('student_status', report.studentStatuses.filter(s => selectedStudentStatuses.has(s.id)).map(s => s.id))}
                  className="text-sm px-3 py-1 text-red-700 bg-red-50 hover:bg-red-100 rounded flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete Selected ({report.studentStatuses.filter(s => selectedStudentStatuses.has(s.id)).length})
                </button>
              )}
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg bg-indigo-50">
            {report.studentStatuses.map((status, idx) => (
              <div key={status.id} className={`p-4 ${idx > 0 ? 'border-t border-gray-300' : ''}`}>
                <div className="flex gap-3">
                  <input
                    type="checkbox"
                    checked={selectedStudentStatuses.has(status.id)}
                    onChange={() => toggleSelection('studentStatus', status.id)}
                    className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="font-bold text-gray-900">{status.program}</h5>
                        {status.specialisation && (
                          <p className="text-sm text-gray-600 mt-1">{status.specialisation}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          Created: {new Date(status.created_at).toLocaleDateString()}
                        </div>
                        {status.created_by && (
                          <div className="text-xs text-indigo-600 font-medium mt-1">
                            {getCreatorName(status.created_by)}
                          </div>
                        )}
                      </div>
                    </div>

                    {status.enrolment_no_value && (
                      <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                        <span className="font-semibold text-gray-700">Enrolment Number:</span>
                        <p className="text-gray-900 mt-1 font-mono">{status.enrolment_no_value}</p>
                      </div>
                    )}

                    {status.roll_no_values && status.roll_no_values.some(v => v) && (
                      <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                        <span className="font-semibold text-gray-700 block mb-2">Roll Numbers:</span>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {status.roll_no_values.map((value, idx) => value && (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Sem {idx + 1}:</span>
                              <span className="text-sm font-mono text-gray-900">{value}</span>
                              {status.roll_no_checkboxes?.[idx] && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(status.provisional_degree_issued || status.degree_issued || status.university_phd_offer_letter_issued ||
                      status.lor_issued || status.recommendation_letter_issued || status.wes_issued ||
                      status.ms_scan_issued || status.ms_hard_copy_issued) && (
                      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                        <span className="font-semibold text-gray-900 block mb-3">Issued Documents:</span>
                        <div className="space-y-2">
                          {status.provisional_degree_issued && (
                            <div className="flex items-center justify-between bg-white p-2 rounded">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-700">Provisional Degree Issued</span>
                              </div>
                              {status.provisional_degree_courier_docket && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                  Docket: {status.provisional_degree_courier_docket}
                                </span>
                              )}
                            </div>
                          )}
                          {status.degree_issued && (
                            <div className="flex items-center justify-between bg-white p-2 rounded">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-700">Degree Issued</span>
                              </div>
                              {status.degree_courier_docket && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                  Docket: {status.degree_courier_docket}
                                </span>
                              )}
                            </div>
                          )}
                          {status.university_phd_offer_letter_issued && (
                            <div className="flex items-center justify-between bg-white p-2 rounded">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-700">University PhD Offer Letter Issued</span>
                              </div>
                              {status.university_phd_offer_letter_courier_docket && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                  Docket: {status.university_phd_offer_letter_courier_docket}
                                </span>
                              )}
                            </div>
                          )}
                          {status.lor_issued && (
                            <div className="flex items-center justify-between bg-white p-2 rounded">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-700">LOR Issued</span>
                              </div>
                              {status.lor_courier_docket && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                  Docket: {status.lor_courier_docket}
                                </span>
                              )}
                            </div>
                          )}
                          {status.recommendation_letter_issued && (
                            <div className="flex items-center justify-between bg-white p-2 rounded">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-700">Recommendation Letter Issued</span>
                              </div>
                              {status.recommendation_letter_courier_docket && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                  Docket: {status.recommendation_letter_courier_docket}
                                </span>
                              )}
                            </div>
                          )}
                          {status.wes_issued && (
                            <div className="flex items-center justify-between bg-white p-2 rounded">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-700">WES Issued</span>
                              </div>
                              {status.wes_courier_docket && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                  Docket: {status.wes_courier_docket}
                                </span>
                              )}
                            </div>
                          )}
                          {status.ms_scan_issued && (
                            <div className="flex items-center justify-between bg-white p-2 rounded">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-700">MS SCAN Issued</span>
                              </div>
                              {status.ms_scan_courier_docket && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                  Docket: {status.ms_scan_courier_docket}
                                </span>
                              )}
                            </div>
                          )}
                          {status.ms_hard_copy_issued && (
                            <div className="flex items-center justify-between bg-white p-2 rounded">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-700">MS Hard Copy Issued</span>
                              </div>
                              {status.ms_hard_copy_courier_docket && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                  Docket: {status.ms_hard_copy_courier_docket}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {(status.ms_scan_checkboxes?.some(v => v) || status.ms_hard_copy_checkboxes?.some(v => v) ||
                      status.ms_hard_copy_courier_checkboxes?.some(v => v)) && (
                      <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                        <span className="font-semibold text-gray-900 block mb-3">Semester-wise Document Status:</span>
                        <div className="space-y-3">
                          {status.ms_scan_checkboxes?.some(v => v) && (
                            <div className="bg-white p-2 rounded">
                              <span className="text-sm font-medium text-gray-700 block mb-2">MS SCAN:</span>
                              <div className="flex flex-wrap gap-2">
                                {status.ms_scan_checkboxes.map((checked, idx) => checked && (
                                  <span key={idx} className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    <CheckCircle className="w-3 h-3" />
                                    Semester {idx + 1}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {status.ms_hard_copy_checkboxes?.some(v => v) && (
                            <div className="bg-white p-2 rounded">
                              <span className="text-sm font-medium text-gray-700 block mb-2">MS Hard Copy:</span>
                              <div className="flex flex-wrap gap-2">
                                {status.ms_hard_copy_checkboxes.map((checked, idx) => checked && (
                                  <span key={idx} className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    <CheckCircle className="w-3 h-3" />
                                    Semester {idx + 1}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {status.ms_hard_copy_courier_checkboxes?.some(v => v) && (
                            <div className="bg-white p-2 rounded">
                              <span className="text-sm font-medium text-gray-700 block mb-2">MS Hard Copy Courier:</span>
                              <div className="flex flex-wrap gap-2">
                                {status.ms_hard_copy_courier_checkboxes.map((checked, idx) => checked && (
                                  <span key={idx} className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    <CheckCircle className="w-3 h-3" />
                                    Semester {idx + 1}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {status.notes && (
                      <div className="mt-4 text-sm">
                        <span className="font-semibold text-gray-700">Notes:</span>
                        <p className="text-gray-600 mt-1 bg-white p-3 rounded">{status.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
