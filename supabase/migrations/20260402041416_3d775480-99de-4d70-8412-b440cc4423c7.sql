
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  cover_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Anyone can view published blogs
CREATE POLICY "Anyone can view published blogs"
ON public.blogs
FOR SELECT
USING (status = 'published');

-- Authors can view their own drafts
CREATE POLICY "Authors can view own drafts"
ON public.blogs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Authenticated users can create blogs
CREATE POLICY "Users can create blogs"
ON public.blogs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own blogs
CREATE POLICY "Users can update own blogs"
ON public.blogs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own blogs
CREATE POLICY "Users can delete own blogs"
ON public.blogs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_blogs_updated_at
BEFORE UPDATE ON public.blogs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
