import { useState, useRef } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import api from "../api";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

export default function ResumeUpload({ onParsed }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please upload a PDF or DOCX file.");
      return;
    }
    setError(null);
    setFileName(file.name);
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/api/resume/upload", formData);
      onParsed(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to parse resume.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-fade-up max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Upload your resume</h2>
        <p className="text-[var(--text-secondary)] text-sm mt-2">We'll parse it into structured sections automatically.</p>
      </div>

      <div
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-14 flex flex-col items-center gap-5 cursor-pointer transition-all duration-200 ${
          dragging
            ? "border-[var(--accent)] bg-[var(--accent-glow)]"
            : "border-[var(--border)] hover:border-[var(--border-hover)] bg-[var(--bg-card)]"
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin" />
            <p className="text-[var(--text-secondary)] text-sm">Parsing <span className="text-[var(--text-primary)] mono">{fileName}</span></p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center">
              <Upload className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <div className="text-center">
              <p className="text-[var(--text-primary)] font-medium">
                Drop your resume here or <span className="text-[var(--accent)]">browse</span>
              </p>
              <p className="text-[var(--text-muted)] text-xs mt-2 tracking-wide uppercase">PDF &middot; DOCX &middot; DOC</p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }}
        />
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 text-[var(--danger)] bg-[var(--danger)]/10 px-4 py-3 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
