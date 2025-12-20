/*
  # Drop Unused Database Indexes

  1. Changes
    - Drop unused indexes to improve database performance and reduce storage overhead
    - Indexes being dropped are not being used by queries according to usage statistics
    
  2. Indexes Removed
    - idx_appointments_contact_id
    - idx_interactions_contact_id
    - idx_student_status_updated_by
    - idx_support_forms_contact_id
    - idx_profiles_created_by
    - idx_student_status_contact_id
    - idx_student_status_created_by
    - idx_contacts_created_by
    - idx_enquiries_created_by
    - idx_appointments_created_by
    - idx_admissions_created_by
    - idx_payments_created_by
    
  3. Notes
    - These indexes were created for optimization but are not being used by the query planner
    - Dropping unused indexes improves write performance and reduces storage costs
    - If future queries require these indexes, they can be recreated
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_appointments_contact_id;
DROP INDEX IF EXISTS idx_interactions_contact_id;
DROP INDEX IF EXISTS idx_student_status_updated_by;
DROP INDEX IF EXISTS idx_support_forms_contact_id;
DROP INDEX IF EXISTS idx_profiles_created_by;
DROP INDEX IF EXISTS idx_student_status_contact_id;
DROP INDEX IF EXISTS idx_student_status_created_by;
DROP INDEX IF EXISTS idx_contacts_created_by;
DROP INDEX IF EXISTS idx_enquiries_created_by;
DROP INDEX IF EXISTS idx_appointments_created_by;
DROP INDEX IF EXISTS idx_admissions_created_by;
DROP INDEX IF EXISTS idx_payments_created_by;