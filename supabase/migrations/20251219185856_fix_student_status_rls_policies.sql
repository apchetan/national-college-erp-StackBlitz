/*
  # Fix Student Status RLS Policies to Use Permission System

  1. Problem
    - Current RLS policies on student_status table directly query profiles table
    - This causes circular dependency issues with RLS on profiles table
    - Users get "new row violates row-level security policy" errors when inserting

  2. Solution
    - Drop existing RLS policies
    - Recreate policies using has_permission() SECURITY DEFINER function
    - This properly checks permissions without circular dependencies

  3. Changes
    - Drop all existing student_status policies
    - Create new policies that use has_permission() function
    - Policies check for 'student_status' resource with appropriate actions

  4. Security Notes
    - has_permission() is SECURITY DEFINER so it bypasses RLS when checking permissions
    - Only users with proper permissions in user_permissions table can access
    - Super admins automatically have all permissions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view student status" ON student_status;
DROP POLICY IF EXISTS "Users can insert student status" ON student_status;
DROP POLICY IF EXISTS "Users can update student status" ON student_status;
DROP POLICY IF EXISTS "Users can delete student status" ON student_status;

-- Create new policies using has_permission function
CREATE POLICY "Users can view student status"
  ON student_status FOR SELECT
  TO authenticated
  USING (has_permission(auth.uid(), 'student_status', 'view'));

CREATE POLICY "Users can create student status"
  ON student_status FOR INSERT
  TO authenticated
  WITH CHECK (has_permission(auth.uid(), 'student_status', 'create'));

CREATE POLICY "Users can update student status"
  ON student_status FOR UPDATE
  TO authenticated
  USING (has_permission(auth.uid(), 'student_status', 'edit'))
  WITH CHECK (has_permission(auth.uid(), 'student_status', 'edit'));

CREATE POLICY "Users can delete student status"
  ON student_status FOR DELETE
  TO authenticated
  USING (has_permission(auth.uid(), 'student_status', 'delete'));
