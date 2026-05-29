import { ArrowLeft, FolderOpen, FileCode, CheckCircle, XCircle } from "lucide-react";

function Indicator({ value, label }) {
  return (
    <span className="flex items-center gap-1 text-xs">
      {value
        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        : <XCircle className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
      <span className={value ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"}>{label}</span>
    </span>
  );
}

export default function LocalScanView({ result, onReset }) {
  return (
    <div className="animate-fade-up space-y-5">
      <button onClick={onReset} className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Scan another
      </button>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
        <div className="flex items-center gap-2.5 mb-1">
          <FolderOpen className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{result.projects_found} projects found</h2>
        </div>
        <p className="text-xs mono text-[var(--text-muted)] ml-6.5">{result.directory}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileCode className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Languages</h3>
            <span className="text-xs text-[var(--text-muted)] ml-auto">{result.all_languages.length}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.all_languages.map((l, i) => (
              <span key={i} className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs border border-blue-500/20">{l}</span>
            ))}
          </div>
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Frameworks</h3>
            <span className="text-xs text-[var(--text-muted)] ml-auto">{result.all_frameworks.length}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.all_frameworks.length > 0
              ? result.all_frameworks.map((f, i) => (
                <span key={i} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs border border-emerald-500/20">{f}</span>
              ))
              : <p className="text-xs text-[var(--text-muted)]">None detected</p>}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {result.projects.map((project, i) => {
          const typeColors = {
            "Full-Stack": "text-violet-400 bg-violet-500/10", Frontend: "text-blue-400 bg-blue-500/10",
            Backend: "text-emerald-400 bg-emerald-500/10", Mobile: "text-pink-400 bg-pink-500/10",
            "AI/ML": "text-purple-400 bg-purple-500/10", "Data Science": "text-amber-400 bg-amber-500/10",
            Systems: "text-red-400 bg-red-500/10", General: "text-[var(--text-muted)] bg-[var(--bg-elevated)]",
          };
          const tc = typeColors[project.project_type] || typeColors.General;
          const cc = { high: "text-[var(--accent)]", medium: "text-amber-400", low: "text-[var(--text-muted)]" };
          return (
            <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-[var(--text-primary)] text-sm">{project.name}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-lg ${tc}`}>{project.project_type}</span>
                  <span className={`text-xs ${cc[project.complexity]}`}>{project.complexity}</span>
                </div>
                <span className="text-xs text-[var(--text-muted)] shrink-0">{project.files_count} files</span>
              </div>
              {project.description && <p className="text-xs text-[var(--text-secondary)]">{project.description}</p>}
              <div className="flex flex-wrap gap-1.5">
                {project.languages.map((l, j) => <span key={`l${j}`} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs">{l}</span>)}
                {project.frameworks.map((f, j) => <span key={`f${j}`} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-xs">{f}</span>)}
              </div>
              <div className="flex gap-4">
                <Indicator value={project.has_readme} label="README" />
                <Indicator value={project.has_tests} label="Tests" />
                <Indicator value={project.has_docker} label="Docker" />
                <Indicator value={project.has_ci} label="CI/CD" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
