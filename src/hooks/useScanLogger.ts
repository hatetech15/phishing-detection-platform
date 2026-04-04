import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useScanLogger() {
  const { user } = useAuth();
  const { toast } = useToast();

  const logScan = async (
    scanType: string,
    inputValue: string,
    resultSummary: string,
    fullResult: any,
    status: 'success' | 'failed' = 'success'
  ) => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to save scan results.", variant: "destructive" });
      return null;
    }

    const { data, error } = await supabase
      .from('functionality_scans' as any)
      .insert({
        user_id: user.id,
        scan_type: scanType,
        input_value: inputValue,
        result_summary: resultSummary,
        full_result: fullResult,
        status,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to log scan:', error);
    }
    return data;
  };

  return { logScan };
}
