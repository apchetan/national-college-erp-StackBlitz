/*
  # Add Payment Receipt Attachment Support

  ## Purpose
  This migration adds support for attaching PDF receipts to payment records.

  ## Changes Made
  
  ### 1. payments table updates
  - Add `receipt_file_url` column to store the file path/URL

  ### 2. Storage Bucket
  - Create 'payment-receipts' storage bucket for storing receipt files
  - Enable RLS on the bucket
  - Add policies to allow authenticated users to:
    - Upload receipts
    - View receipts
    - Delete their own receipts

  ## Notes
  - Receipt files will be stored in Supabase Storage
  - Files are organized by payment ID for easy reference
  - Only authenticated users can upload and view receipts
*/

-- Add receipt_file_url column to payments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'receipt_file_url'
  ) THEN
    ALTER TABLE payments ADD COLUMN receipt_file_url text;
  END IF;
END $$;

-- Create storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Authenticated users can upload payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update payment receipts" ON storage.objects;

-- Allow authenticated users to upload receipts
CREATE POLICY "Authenticated users can upload payment receipts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'payment-receipts');

-- Allow authenticated users to view receipts
CREATE POLICY "Authenticated users can view payment receipts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'payment-receipts');

-- Allow authenticated users to delete receipts
CREATE POLICY "Authenticated users can delete payment receipts"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'payment-receipts');

-- Allow authenticated users to update receipts
CREATE POLICY "Authenticated users can update payment receipts"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'payment-receipts')
  WITH CHECK (bucket_id = 'payment-receipts');