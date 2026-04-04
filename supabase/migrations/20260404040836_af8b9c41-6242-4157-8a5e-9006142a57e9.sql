
CREATE TABLE public.functionality_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scan_type TEXT NOT NULL,
  input_value TEXT NOT NULL,
  result_summary TEXT,
  full_result JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.functionality_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own functionality scans"
ON public.functionality_scans
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own functionality scans"
ON public.functionality_scans
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own functionality scans"
ON public.functionality_scans
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_functionality_scans_user_id ON public.functionality_scans(user_id);
CREATE INDEX idx_functionality_scans_scan_type ON public.functionality_scans(scan_type);
CREATE INDEX idx_functionality_scans_created_at ON public.functionality_scans(created_at DESC);
