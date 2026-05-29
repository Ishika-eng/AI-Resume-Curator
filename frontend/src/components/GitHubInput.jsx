import { useState } from "react";
import { GitBranch, Loader2, AlertCircle, Key } from "lucide-react";
import axios from "axios";

export default function GitHubInput({ onAnalyzed, onSkip }) {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter a GitHub username.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/api/github/analyze", {
        username: username.trim(),
        token: token.trim() || null,
      });
      onAnalyzed(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to analyze GitHub profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-white">
          Connect GitHub Profile
        </h2>
        <p className="text-slate-400 max-w-md">
          We'll analyze your repositories to discover skills and projects
          missing from your resume.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">
            GitHub Username *
          </label>
          <div className="relative">
            <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. octocat"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-11 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-1.5"
          >
            <Key className="w-3.5 h-3.5" />
            {showToken ? "Hide" : "Add"} personal access token (optional)
          </button>
          {showToken && (
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          )}
          {showToken && (
            <p className="text-xs text-slate-600 mt-1">
              Increases API rate limit from 60 to 5,000 requests/hour. No scopes needed.
            </p>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-3 rounded-lg">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing repositories...
            </>
          ) : (
            <>
              <GitBranch className="w-5 h-5" />
              Analyze GitHub Profile
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onSkip}
          className="w-full text-slate-500 hover:text-slate-300 text-sm py-2 transition-colors"
        >
          Skip this step
        </button>
      </form>
    </div>
  );
}
