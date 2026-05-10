import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function TestCrosswordPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-crossword", {
        body: { tier: "junior", topic: "internet safety" },
      });
      console.log("generate-crossword response:", { data, error });
      if (error) throw error;
      setResult(data);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold">Test: generate-crossword</h1>
        <p className="text-sm text-muted-foreground">
          tier: <code>junior</code> · topic: <code>internet safety</code>
        </p>
        <button
          onClick={run}
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Calling..." : "Call generate-crossword"}
        </button>

        {error && (
          <pre className="overflow-auto rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </pre>
        )}

        {result !== null && (
          <pre className="overflow-auto rounded-md border bg-muted p-4 text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
