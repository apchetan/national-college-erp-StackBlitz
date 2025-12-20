/*
  # Add Indexes for Foreign Keys

  ## Problem
  Multiple foreign keys lack covering indexes, leading to suboptimal query performance
  when joining tables or checking referential integrity.

  ## Solution
  Add B-tree indexes for all unindexed foreign key columns to improve:
  - JOIN performance
  - Foreign key constraint validation speed
  - Query optimizer efficiency

  ## Changes
  Add indexes for:
  - appointments.contact_id
  - interactions.contact_id
  - profiles.created_by
  - student_status.contact_id
  - student_status.created_by
  - student_status.updated_by
  - support_forms.contact_id

  ## Performance Impact
  - Faster JOIN operations on these columns
  - Improved foreign key constraint checks
  - Better query planning by PostgreSQL optimizer
  - Minimal storage overhead
*/

-- Add index for appointments.contact_id foreign key
CREATE INDEX IF NOT EXISTS idx_appointments_contact_id 
  ON appointments(contact_id);

-- Add index for interactions.contact_id foreign key
CREATE INDEX IF NOT EXISTS idx_interactions_contact_id 
  ON interactions(contact_id);

-- Add index for profiles.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_profiles_created_by 
  ON profiles(created_by);

-- Add index for student_status.contact_id foreign key
CREATE INDEX IF NOT EXISTS idx_student_status_contact_id 
  ON student_status(contact_id);

-- Add index for student_status.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_student_status_created_by 
  ON student_status(created_by);

-- Add index for student_status.updated_by foreign key
CREATE INDEX IF NOT EXISTS idx_student_status_updated_by 
  ON student_status(updated_by);

-- Add index for support_forms.contact_id foreign key
CREATE INDEX IF NOT EXISTS idx_support_forms_contact_id 
  ON support_forms(contact_id);
