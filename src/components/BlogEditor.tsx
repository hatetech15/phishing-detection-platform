import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BlogEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const ToolbarButton = ({
  onClick,
  active,
  icon: Icon,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  icon: any;
  label: string;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        onClick={onClick}
        className={`p-1.5 rounded-md transition-colors ${
          active
            ? "bg-primary/20 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
      >
        <Icon className="w-4 h-4" />
      </button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="text-xs">
      {label}
    </TooltipContent>
  </Tooltip>
);

const BlogEditor = ({ content, onChange }: BlogEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({ openOnClick: false }),
      Image,
      Underline,
      Placeholder.configure({
        placeholder: "Start writing your blog post...",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm max-w-none min-h-[400px] focus:outline-none px-4 py-3 prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-li:text-muted-foreground prose-blockquote:border-primary/30 prose-code:text-primary",
      },
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden bg-background/50">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border/40 bg-muted/30">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          icon={Bold}
          label="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          icon={Italic}
          label="Italic"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          icon={UnderlineIcon}
          label="Underline"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          icon={Strikethrough}
          label="Strikethrough"
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          icon={Heading1}
          label="Heading 1"
        />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          icon={Heading2}
          label="Heading 2"
        />
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          icon={Heading3}
          label="Heading 3"
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          icon={List}
          label="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          icon={ListOrdered}
          label="Ordered List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          icon={Quote}
          label="Quote"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          icon={Code}
          label="Code Block"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          icon={Minus}
          label="Divider"
        />

        <Separator orientation="vertical" className="h-6 mx-1" />

        <ToolbarButton onClick={addLink} active={editor.isActive("link")} icon={LinkIcon} label="Add Link" />
        <ToolbarButton onClick={addImage} icon={ImageIcon} label="Add Image" />

        <div className="flex-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          icon={Undo}
          label="Undo"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          icon={Redo}
          label="Redo"
        />
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default BlogEditor;
