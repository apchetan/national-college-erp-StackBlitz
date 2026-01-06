/*
  # Fix log_interaction Trigger Function Search Path

  ## Purpose
    Fix the trigger version of log_interaction function to have immutable search_path

  ## Security Impact
    - Prevents potential SQL injection via search_path manipulation
    - Ensures function always executes in predictable schema context

  ## Changes
    - Add SET search_path = public to the trigger function
*/

CREATE OR REPLACE FUNCTION log_interaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO interactions (contact_id, interaction_type, reference_id, description)
  VALUES (
    NEW.contact_id,
    TG_ARGV[0],
    NEW.id,
    TG_ARGV[1] || ' created'
  );
  RETURN NEW;
END;
$$;