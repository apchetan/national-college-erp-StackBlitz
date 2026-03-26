/*
  # Fix Profiles Infinite Recursion - Final Fix
  
  1. Problem
    - UPDATE policy WITH CHECK still queries profiles table
    - Creates infinite recursion loop
  
  2. Solution
    - Remove the role check from WITH CHECK
    - Users can update their own profile but the UPDATE trigger/constraint should prevent role changes
    - Keep policies completely non-recursive
  
  3. Security
    - Role changes prevented at application level
    - Super admins have full control via separate policy
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can update own basic profile" ON profiles;

-- Recreate without recursive check
CREATE POLICY "Users can update own basic profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add a constraint to prevent regular users from changing their own role
-- (This is safer than a recursive RLS check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'prevent_role_self_modification'
  ) THEN
    CREATE OR REPLACE FUNCTION prevent_role_self_modification()
    RETURNS TRIGGER AS $func$
    BEGIN
      -- Only prevent self-role-modification if user is not a super admin
      IF OLD.role IS DISTINCT FROM NEW.role AND auth.uid() = NEW.id THEN
        -- Check if user is super admin
        IF NOT EXISTS (
          SELECT 1 FROM user_permissions
          WHERE user_id = auth.uid()
          AND resource = 'super_admin'
          AND can_edit = true
        ) THEN
          RAISE EXCEPTION 'Users cannot change their own role';
        END IF;
      END IF;
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER;

    CREATE TRIGGER prevent_role_self_modification
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION prevent_role_self_modification();
  END IF;
END $$;
