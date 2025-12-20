/*
  # Add Courier Docket Number Fields
  
  1. New Columns Added
    - `provisional_degree_courier_docket` - Text field for Provisional Degree courier docket number
    - `degree_courier_docket` - Text field for Degree courier docket number
    - `university_phd_offer_letter_courier_docket` - Text field for University PhD Offer Letter courier docket number
  
  2. Purpose
    These fields store courier docket numbers when documents are issued
*/

ALTER TABLE student_status
ADD COLUMN IF NOT EXISTS provisional_degree_courier_docket text,
ADD COLUMN IF NOT EXISTS degree_courier_docket text,
ADD COLUMN IF NOT EXISTS university_phd_offer_letter_courier_docket text;