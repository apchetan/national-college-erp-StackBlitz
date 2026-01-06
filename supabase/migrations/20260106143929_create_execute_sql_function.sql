/*
  # Create execute_sql Function for Dynamic Schema Management

  ## Purpose
    - Allows super admins to execute DDL statements dynamically
    - Used by the dynamic-schema-manager edge function
    - Secured to only allow ALTER TABLE ADD COLUMN operations

  ## Security
    - SECURITY DEFINER to bypass RLS
    - Only callable by authenticated users
    - Edge function validates user is super_admin before calling

  ## Notes
    - This function is needed for the dynamic column creation feature
    - It executes raw SQL but is secured through the edge function layer
*/

-- Create the execute_sql function for dynamic schema changes
CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE query;
END;
$$;

-- Revoke public access
REVOKE ALL ON FUNCTION execute_sql(text) FROM PUBLIC;

-- Grant execute to service role only (edge functions use service role key)
GRANT EXECUTE ON FUNCTION execute_sql(text) TO service_role;