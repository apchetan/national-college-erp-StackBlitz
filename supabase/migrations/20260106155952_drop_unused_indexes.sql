/*
  # Drop Unused Indexes

  ## Purpose
    Remove all unused indexes to improve write performance and reduce storage

  ## Changes
    - Drop unused indexes from profiles, student_status, contacts, payments
    - Drop unused indexes from enquiries, admissions, interactions, appointments
    - Drop unused indexes from column_registry, mapping_templates, schema_change_log, import_sessions

  ## Impact
    - Improved write performance
    - Reduced storage usage
    - No impact on query performance (indexes are unused)
*/

DROP INDEX IF EXISTS idx_profiles_created_by;
DROP INDEX IF EXISTS idx_student_status_admission_id;
DROP INDEX IF EXISTS idx_student_status_contact_id;
DROP INDEX IF EXISTS idx_student_status_program;
DROP INDEX IF EXISTS idx_student_status_created_at;
DROP INDEX IF EXISTS idx_student_status_created_by_fkey;
DROP INDEX IF EXISTS idx_student_status_updated_by_fkey;
DROP INDEX IF EXISTS idx_contacts_email;
DROP INDEX IF EXISTS idx_contacts_status;
DROP INDEX IF EXISTS idx_contacts_mobile1;
DROP INDEX IF EXISTS idx_contacts_mobile2;
DROP INDEX IF EXISTS idx_payments_admission_id;
DROP INDEX IF EXISTS idx_payments_receipt_date;
DROP INDEX IF EXISTS idx_enquiries_contact_id;
DROP INDEX IF EXISTS idx_enquiries_status;
DROP INDEX IF EXISTS idx_admissions_contact_id;
DROP INDEX IF EXISTS idx_admissions_status;
DROP INDEX IF EXISTS idx_interactions_contact_id;
DROP INDEX IF EXISTS idx_appointments_contact_id;
DROP INDEX IF EXISTS idx_appointments_date;
DROP INDEX IF EXISTS idx_appointments_status;
DROP INDEX IF EXISTS idx_column_registry_created_by;
DROP INDEX IF EXISTS idx_mapping_templates_created_by;
DROP INDEX IF EXISTS idx_schema_log_table;
DROP INDEX IF EXISTS idx_schema_change_log_executed_by;
DROP INDEX IF EXISTS idx_import_sessions_user;