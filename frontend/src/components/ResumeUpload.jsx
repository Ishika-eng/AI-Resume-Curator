import { useState, useRef } from "react";
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";

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
      const res = await axios.post(
        "http://localhost:8000/api/resume/upload",
        formData
      );
      onParsed(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to parse resume. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-white">Upload Your Resume</h2>
        <p className="text-slate-400 max-w-md">
          Upload your resume to get started. We support PDF and DOCX formats.
        </p>
      </div>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-all ${
          dragging
            ? "border-violet-400 bg-violet-500/10"
            : "border-slate-600 hover:border-slate-500 bg-slate-800/50"
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="w-12 h-12 text-violet-400 animate-spin" />
            <p className="text-slate-300">Parsing {fileName}...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center">
              <Upload className="w-8 h-8 text-violet-400" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium">
                Drop your resume here or click to browse
              </p>
              <p className="text-slate-500 text-sm mt-1">PDF, DOC, DOCX</p>
            </div>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-3 rounded-lg max-w-lg w-full">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-6 text-slate-500 text-sm">
        <span className="flex items-center gap-1.5">
          <FileText className="w-4 h-4" /> PDF
        </span>
        <span className="flex items-center gap-1.5">
          <FileText className="w-4 h-4" /> DOCX
        </span>
        <span className="flex items-center gap-1.5">
          <FileText className="w-4 h-4" /> DOC
        </span>
      </div>
    </div>
  );
}
