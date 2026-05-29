import { useState } from "react";
import { GitBranch, Loader2, AlertCircle, Key, ArrowRight } from "lucide-react";
import api from "../api";

export default function GitHubInput({ onAnalyzed, onSkip }) {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) { setError("Enter a GitHub username."); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/api/github/analyze", { username: username.trim(), token: token.trim() || null });
      onAnalyzed(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to analyze.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Connect GitHub</h2>
        <p className="text-[var(--text-secondary)] text-sm mt-2">Discover skills and projects missing from your resume.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <GitBranch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="GitHub username"
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowToken(!showToken)}
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
        >
          <Key className="w-3 h-3" />
          {showToken ? "Hide" : "Add"} access token (optional)
        </button>

        {showToken && (
          <div>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1.5">Increases rate limit to 5,000 req/hr. No scopes needed.</p>
          </div>
        )}

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
          {loading ? "Analyzing repos..." : "Analyze GitHub"}
        </button>

        <button type="button" onClick={onSkip} className="w-full py-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-sm transition-colors">
          Skip this step
        </button>
      </form>
    </div>
  );
}
