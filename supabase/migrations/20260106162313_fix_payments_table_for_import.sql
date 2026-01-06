/*
  # Fix Payments Table for Import

  ## Purpose
    Make admission_id nullable to support direct payment imports without requiring admission records

  ## Changes
    - Change admission_id from NOT NULL to NULL
    - This allows importing payment data directly from CSV files
    - Payments can now be imported without requiring pre-existing admission records

  ## Impact
    - Existing data is not affected
    - New payment imports will work without admission_id requirement
    - Applications should handle NULL admission_id appropriately
*/

-- Make admission_id nullable to support flexible imports
ALTER TABLE payments 
ALTER COLUMN admission_id DROP NOT NULL;