/*
  # Add Issued Checkboxes and Courier Docket Fields for All Document Types
  
  1. New Columns Added
    - `lor_issued` - Boolean for LOR issued checkbox
    - `lor_courier_docket` - Text field for LOR courier docket number
    - `recommendation_letter_issued` - Boolean for Recommendation Letter issued checkbox
    - `recommendation_letter_courier_docket` - Text field for Recommendation Letter courier docket number
    - `wes_issued` - Boolean for WES issued checkbox
    - `wes_courier_docket` - Text field for WES courier docket number
    - `ms_scan_issued` - Boolean for MS SCAN issued checkbox
    - `ms_scan_courier_docket` - Text field for MS SCAN courier docket number
    - `ms_hard_copy_issued` - Boolean for MS Hard Copy issued checkbox
    - `ms_hard_copy_courier_docket` - Text field for MS Hard Copy courier docket number
  
  2. Purpose
    These fields allow tracking of issued status and courier information for all document types that can be received and then issued to students.
*/

ALTER TABLE student_status
ADD COLUMN IF NOT EXISTS lor_issued boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lor_courier_docket text,
ADD COLUMN IF NOT EXISTS recommendation_letter_issued boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS recommendation_letter_courier_docket text,
ADD COLUMN IF NOT EXISTS wes_issued boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS wes_courier_docket text,
ADD COLUMN IF NOT EXISTS ms_scan_issued boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ms_scan_courier_docket text,
ADD COLUMN IF NOT EXISTS ms_hard_copy_issued boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ms_hard_copy_courier_docket text;