import { FileText, ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

function Section({ section }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-800/80 hover:bg-slate-800 transition-colors text-left"
      >
        <span className="font-medium text-white">{section.title}</span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {open && (
        <div className="px-5 py-4 space-y-2 bg-slate-800/30">
          {section.content.map((line, i) => (
            <p key={i} className="text-slate-300 text-sm leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ParsedResumeView({ resume, onReset }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Upload another
        </button>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-1">
          <FileText className="w-5 h-5 text-violet-400" />
          <h2 className="text-xl font-semibold text-white">{resume.filename}</h2>
          <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full uppercase">
            {resume.file_type}
          </span>
        </div>
        <p className="text-slate-500 text-sm ml-8">
          {resume.sections.length} sections detected
          {resume.metadata.page_count &&
            ` · ${resume.metadata.page_count} page${resume.metadata.page_count > 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium text-white">Parsed Sections</h3>
        {resume.sections.map((section, i) => (
          <Section key={i} section={section} />
        ))}
      </div>
    </div>
  );
}
