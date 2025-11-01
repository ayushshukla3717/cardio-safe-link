-- Create storage bucket for medical records
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-records',
  'medical-records',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- RLS policies for medical records bucket
CREATE POLICY "Users can upload their own medical records"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'medical-records' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own medical records"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-records' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Doctors and admins can view all medical records"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-records' AND
  (has_role(auth.uid(), 'Doctor') OR has_role(auth.uid(), 'Admin'))
);

CREATE POLICY "Users can delete their own medical records"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'medical-records' AND
  (storage.foldername(name))[1] = auth.uid()::text
);