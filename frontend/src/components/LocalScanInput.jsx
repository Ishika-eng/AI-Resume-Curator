import { useState } from "react";
import { FolderSearch, Loader2, AlertCircle } from "lucide-react";
import api from "../api";

export default function LocalScanInput({ onScanned, onSkip }) {
  const [directory, setDirectory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!directory.trim()) {
      setError("Please enter a directory path.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/api/local/scan", {
        directory: directory.trim(),
      });
      onScanned(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to scan directory."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-white">
          Scan Local Projects
        </h2>
        <p className="text-slate-400 max-w-md">
          Point to a folder containing your projects. We'll detect technologies,
          frameworks, and complexity to find skills missing from your resume.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">
            Projects Directory *
          </label>
          <div className="relative">
            <FolderSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={directory}
              onChange={(e) => setDirectory(e.target.value)}
              placeholder="e.g. /Users/you/Projects"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-11 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors font-mono text-sm"
            />
          </div>
          <p className="text-xs text-slate-600 mt-1.5">
            We'll scan subfolders for project markers like package.json, requirements.txt, etc.
          </p>
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
              Scanning projects...
            </>
          ) : (
            <>
              <FolderSearch className="w-5 h-5" />
              Scan Directory
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
