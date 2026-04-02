import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/PageLayout";
import BlogEditor from "@/components/BlogEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const BlogCreate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isEdit = !!id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (isEdit) {
      loadBlog();
    }
  }, [id, user]);

  const loadBlog = async () => {
    const { data } = await supabase
      .from("blogs")
      .select("*")
      .eq("id", id!)
      .single();
    if (data) {
      setTitle(data.title);
      setContent(data.content || "");
      setExcerpt(data.excerpt || "");
      setCoverImageUrl(data.cover_image_url || "");
      setTags((data.tags as string[]) || []);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleSave = async (status: "draft" | "published") => {
    if (!user) return;
    if (!title.trim()) {
      toast({ title: "Title required", description: "Please enter a title for your blog post.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload = {
      title: title.trim(),
      content,
      excerpt: excerpt.trim() || null,
      cover_image_url: coverImageUrl.trim() || null,
      tags,
      status,
      user_id: user.id,
      published_at: status === "published" ? new Date().toISOString() : null,
    };

    let error;
    if (isEdit) {
      ({ error } = await supabase.from("blogs").update(payload).eq("id", id!));
    } else {
      ({ error } = await supabase.from("blogs").insert(payload));
    }

    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: status === "published" ? "Published!" : "Draft saved",
        description: status === "published" ? "Your blog post is now live." : "Your draft has been saved.",
      });
      navigate("/blog");
    }
  };

  return (
    <PageLayout>
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <Button variant="ghost" onClick={() => navigate("/blog")} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => handleSave("draft")} disabled={saving} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Draft
                </Button>
                <Button onClick={() => handleSave("published")} disabled={saving} className="gap-2">
                  <Send className="w-4 h-4" />
                  Publish
                </Button>
              </div>
            </div>

            <div className="glass-panel rounded-xl border border-border/40 p-6 md:p-8 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your blog title..."
                  className="text-lg font-medium bg-background/50"
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-sm font-medium">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief summary of your post..."
                  className="bg-background/50 min-h-[60px]"
                  rows={2}
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <Label htmlFor="cover" className="text-sm font-medium">Cover Image URL</Label>
                <Input
                  id="cover"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-background/50"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Add a tag..."
                    className="bg-background/50"
                  />
                  <Button type="button" variant="outline" onClick={addTag} size="sm">
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Editor */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Content</Label>
                <BlogEditor content={content} onChange={setContent} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default BlogCreate;
