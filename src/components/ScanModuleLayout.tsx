import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";

interface ScanModuleLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

const ScanModuleLayout = ({ title, description, children }: ScanModuleLayoutProps) => {
  return (
    <PageLayout>
      <div className="container py-24 min-h-screen max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            to="/functionalities"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Functionalities
          </Link>
          <h1 className="text-3xl font-bold font-mono mb-2">
            {title}
          </h1>
          <p className="text-muted-foreground mb-8">{description}</p>
        </motion.div>
        {children}
      </div>
    </PageLayout>
  );
};

export default ScanModuleLayout;
