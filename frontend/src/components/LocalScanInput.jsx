import { useState } from "react";
import { FolderSearch, Loader2, AlertCircle, ArrowRight, CloudOff, Monitor } from "lucide-react";
import api from "../api";

const isCloud = !window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1");

export default function LocalScanInput({ onScanned, onSkip }) {
  const [directory, setDirectory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!directory.trim()) { setError("Enter a directory path."); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/api/local/scan", { directory: directory.trim() });
      onScanned(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to scan.");
    } finally {
      setLoading(false);
    }
  };

  if (isCloud) {
    return (
      <div className="animate-fade-up max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Scan local projects</h2>
          <p className="text-[var(--text-secondary)] text-sm mt-2">Discover hidden skills from your local project files.</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center mx-auto">
            <CloudOff className="w-6 h-6 text-[var(--text-muted)]" />
          </div>
          <div>
            <p className="text-[var(--text-primary)] font-medium">Not available in cloud mode</p>
            <p className="text-[var(--text-secondary)] text-sm mt-2">
              Local project scanning requires the backend to run on your machine.
              To use this feature, clone the project and run it locally.
            </p>
          </div>
          <div className="bg-[var(--bg-elevated)] rounded-lg p-3 text-left">
            <p className="text-xs text-[var(--text-muted)] mb-1.5">Run locally:</p>
            <code className="text-xs text-[var(--accent)] mono">
              git clone https://github.com/Ishika-eng/AI-Resume-Curator.git<br />
              cd AI-Resume-Curator && ./start.sh
            </code>
          </div>
        </div>

        <button type="button" onClick={onSkip} className="w-full mt-4 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
          <ArrowRight className="w-4 h-4" />
          Continue without local scan
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-up max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Scan local projects</h2>
        <p className="text-[var(--text-secondary)] text-sm mt-2">Point to a folder with your projects to discover hidden skills.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <FolderSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={directory}
            onChange={(e) => setDirectory(e.target.value)}
            placeholder="/Users/you/Projects"
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-sm mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>
        <p className="text-xs text-[var(--text-muted)]">We'll scan for package.json, requirements.txt, and other project markers.</p>

        {error && (
          <div className="flex items-center gap-2 text-[var(--danger)] text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          {loading ? "Scanning..." : "Scan directory"}
        </button>

        <button type="button" onClick={onSkip} className="w-full py-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-sm transition-colors">
          Skip this step
        </button>
      </form>
    </div>
  );
}
