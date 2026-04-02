import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Clock, Tag, User, Search, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Blog {
  id: string;
  title: string;
  excerpt: string | null;
  tags: string[];
  status: string;
  published_at: string | null;
  created_at: string;
  user_id: string;
}

const Blog = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, [user]);

  const fetchBlogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBlogs(data as Blog[]);
    }
    setLoading(false);
  };

  const allTags = Array.from(new Set(blogs.flatMap((b) => b.tags || [])));

  const filtered = blogs.filter((b) => {
    const matchSearch =
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.excerpt && b.excerpt.toLowerCase().includes(search.toLowerCase()));
    const matchTag = !selectedTag || (b.tags && b.tags.includes(selectedTag));
    return matchSearch && matchTag;
  });

  const handleSelect = async (blog: Blog) => {
    const { data } = await supabase
      .from("blogs")
      .select("*")
      .eq("id", blog.id)
      .single();
    if (data) setSelectedBlog(data);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <PageLayout>
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold font-mono text-foreground">
                Blog
              </h1>
              <p className="text-muted-foreground mt-1">
                Insights on cybersecurity, phishing threats & digital safety
              </p>
            </div>
            {user && (
              <Link to="/blog/new">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create New Blog
                </Button>
              </Link>
            )}
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left sidebar - blog list */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:w-80 xl:w-96 shrink-0"
            >
              <div className="glass-panel rounded-xl border border-border/40 p-4 sticky top-24">
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search blogs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-background/50"
                  />
                </div>

                {/* Tags filter */}
                {allTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <Badge
                      variant={selectedTag === null ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => setSelectedTag(null)}
                    >
                      All
                    </Badge>
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTag === tag ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() =>
                          setSelectedTag(selectedTag === tag ? null : tag)
                        }
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Blog list */}
                <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Loading blogs...
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
                      <p className="text-muted-foreground text-sm">
                        No blogs found
                      </p>
                      {user && (
                        <Link to="/blog/new">
                          <Button variant="link" size="sm" className="mt-2">
                            Write the first one
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    filtered.map((blog) => (
                      <button
                        key={blog.id}
                        onClick={() => handleSelect(blog)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-accent/50 group ${
                          selectedBlog?.id === blog.id
                            ? "bg-accent/70 border border-border/60"
                            : "border border-transparent"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {blog.title}
                          </h3>
                          {blog.status === "draft" && (
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              Draft
                            </Badge>
                          )}
                        </div>
                        {blog.excerpt && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {blog.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground/70">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(blog.published_at || blog.created_at)}
                          </span>
                          {blog.tags && blog.tags.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {blog.tags[0]}
                              {blog.tags.length > 1 && ` +${blog.tags.length - 1}`}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </motion.aside>

            {/* Right content area */}
            <motion.main
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 min-w-0"
            >
              {selectedBlog ? (
                <article className="glass-panel rounded-xl border border-border/40 p-6 md:p-10">
                  <div className="mb-6">
                    {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {selectedBlog.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {selectedBlog.title}
                    </h1>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {formatDate(selectedBlog.published_at || selectedBlog.created_at)}
                      </span>
                    </div>
                  </div>

                  {selectedBlog.cover_image_url && (
                    <img
                      src={selectedBlog.cover_image_url}
                      alt={selectedBlog.title}
                      className="w-full h-64 object-cover rounded-lg mb-6"
                    />
                  )}

                  <div
                    className="prose prose-invert prose-sm max-w-none
                      prose-headings:text-foreground prose-p:text-muted-foreground
                      prose-strong:text-foreground prose-a:text-primary
                      prose-li:text-muted-foreground prose-blockquote:border-primary/30
                      prose-blockquote:text-muted-foreground prose-code:text-primary"
                    dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                  />

                  {user && user.id === selectedBlog.user_id && (
                    <div className="mt-8 pt-6 border-t border-border/30">
                      <Link to={`/blog/edit/${selectedBlog.id}`}>
                        <Button variant="outline" size="sm">
                          Edit Post
                        </Button>
                      </Link>
                    </div>
                  )}
                </article>
              ) : (
                <div className="glass-panel rounded-xl border border-border/40 flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
                    <h2 className="text-lg font-medium text-muted-foreground">
                      Select a blog post
                    </h2>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                      Choose from the list on the left to start reading
                    </p>
                  </div>
                </div>
              )}
            </motion.main>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Blog;
