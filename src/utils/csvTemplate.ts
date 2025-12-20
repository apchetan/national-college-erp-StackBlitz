export function downloadStudentStatusCSVTemplate() {
  const headers = [
    'Contact Email',
    'Program',
    'Specialisation',
    'Courseware Exam Status',
    'Degree Status',
    'Degree Issued',
    'Degree Courier Docket',
    'Enrolment No Status',
    'Enrolment No Value',
    'Exam Status',
    'LOR Status',
    'LOR Issued',
    'LOR Courier Docket',
    'MS Hard Copy Status',
    'MS Hard Copy Issued',
    'MS Hard Copy Courier Docket',
    'MS Hard Copy Courier Status',
    'MS SCAN Status',
    'MS SCAN Issued',
    'MS SCAN Courier Docket',
    'Provisional Degree Status',
    'Provisional Degree Issued',
    'Provisional Degree Courier Docket',
    'Provisional Degree Courier Status',
    'Recommendation Letter Status',
    'Recommendation Letter Issued',
    'Recommendation Letter Courier Docket',
    'Result Status',
    'Roll No Status',
    'University PhD Offer Letter Status',
    'University PhD Offer Letter Issued',
    'University PhD Offer Letter Courier Docket',
    'University Visit Status',
    'University Visit1 Status',
    'University Visit2 Status',
    'University Visit3 Status',
    'VIVA Status',
    'WES Status',
    'WES Issued',
    'WES Courier Docket',
    'Additional Notes',
  ];

  const exampleRow = [
    'student@example.com',
    'PhD',
    'Computer Science',
    'Done',
    'Received',
    'true',
    'DKT123456',
    'Received',
    'ENR2024001',
    '',
    'Received',
    'true',
    'DKT123457',
    'Received',
    'true',
    'DKT123458',
    'Sent',
    'Received',
    'true',
    'DKT123459',
    'Received',
    'true',
    'DKT123460',
    'Sent',
    'Received',
    'false',
    '',
    'Declared',
    'Received',
    'Received',
    'true',
    'DKT123461',
    'Visited',
    'Visited',
    'Not Visited',
    'Not Visited',
    'Visited',
    'Received',
    'false',
    '',
    'Student progressing well',
  ];

  const emptyRow = headers.map(() => '');

  const rows = [
    headers.map(h => `"${h}"`).join(','),
    exampleRow.map(v => `"${v}"`).join(','),
    emptyRow.join(','),
    emptyRow.join(','),
    emptyRow.join(','),
  ];

  const csvContent = rows.join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'student_status_template.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadEnquiryCSVTemplate() {
  const headers = [
    'First Name',
    'Last Name',
    'Email Address',
    'Phone Number',
    'Date of Birth (DD-MM-YYYY)',
    'City',
    'Current Company/Organization',
    'How did you hear about us',
    'Enquiry Type',
    'Subject',
    'Message',
    'Priority',
    'Annual Salary',
    'Course',
    'Specialisation',
    'Previous Institution',
    'Years of Experience',
    'Additional Notes'
  ];

  const exampleRow = [
    'John',
    'Doe',
    'john.doe@example.com',
    '+1 (555) 123-4567',
    '15-01-1990',
    'Mumbai',
    'Tech Corp',
    'google',
    'general',
    'Interested in MBA program',
    'I would like to know more about the MBA program offerings',
    'medium',
    '75000',
    'MBA',
    'Finance',
    'State University',
    '5',
    'Looking for weekend classes'
  ];

  const emptyRow = headers.map(() => '');

  const rows = [
    headers.map(h => `"${h}"`).join(','),
    exampleRow.map(v => `"${v}"`).join(','),
    emptyRow.join(','),
    emptyRow.join(','),
    emptyRow.join(','),
  ];

  const csvContent = rows.join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'enquiry_form_template.csv');
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
