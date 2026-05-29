import { useState } from "react";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import api from "../api";

export default function JobDescriptionInput({ onAnalyzed }) {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) { setError("Paste a job description first."); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/api/job/analyze", { text, title: title || null, company: company || null });
      onAnalyzed(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to analyze.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-up max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Paste the job description</h2>
        <p className="text-[var(--text-secondary)] text-sm mt-2">We'll extract skills, keywords, and requirements.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Job title (optional)"
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company (optional)"
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the full job description here..."
          rows={10}
          className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-y leading-relaxed"
        />

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
          {loading ? "Analyzing..." : "Analyze job description"}
        </button>
      </form>
    </div>
  );
}
