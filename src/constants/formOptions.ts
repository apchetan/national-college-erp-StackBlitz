export const QUALIFICATIONS = [
  '10th',
  '12th',
  'ITI',
  'Diploma Engg.',
  'Bachelors Degree',
  'Masters Degree',
  'CA/CS',
  'Other',
];

export const PROGRAMS = [
  { id: 'PhD', name: 'PhD' },
  { id: 'MBA', name: 'MBA' },
  { id: 'BTech', name: 'BTech' },
  { id: 'MCA', name: 'MCA' },
  { id: 'MSc', name: 'MSc' },
  { id: 'MTech', name: 'MTech' }
];

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export const EMPLOYMENT_STATUS = [
  'Employed',
  'Unemployed',
  'Self Employed',
  'Freelancer',
  'Student',
  'Retired',
  'Other'
];

export function generateYears(startYear: number = 1970, endYear: number = new Date().getFullYear()): number[] {
  const years: number[] = [];
  for (let year = endYear; year >= startYear; year--) {
    years.push(year);
  }
  return years;
}

export function getAvailableSpecialisations(
  program: string,
  specialisations: Record<string, string[]>
): string[] {
  if (program === 'PhD') {
    return [];
  }
  return specialisations[program] || specialisations.default || [];
}
