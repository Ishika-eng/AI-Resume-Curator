import {
  ArrowLeft,
  FolderOpen,
  FileCode,
  CheckCircle,
  XCircle,
} from "lucide-react";

function Badge({ label, variant = "default" }) {
  const styles = {
    default: "bg-slate-700/50 text-slate-300 border-slate-600/50",
    language: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    framework: "bg-green-500/20 text-green-300 border-green-500/30",
    high: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    low: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[variant]}`}
    >
      {label}
    </span>
  );
}

function Indicator({ value, label }) {
  return (
    <span className="flex items-center gap-1 text-xs">
      {value ? (
        <CheckCircle className="w-3.5 h-3.5 text-green-400" />
      ) : (
        <XCircle className="w-3.5 h-3.5 text-slate-600" />
      )}
      <span className={value ? "text-slate-300" : "text-slate-600"}>
        {label}
      </span>
    </span>
  );
}

function ProjectTypeIcon({ type }) {
  const colors = {
    "Full-Stack": "bg-violet-500/20 text-violet-300",
    Frontend: "bg-blue-500/20 text-blue-300",
    Backend: "bg-green-500/20 text-green-300",
    Mobile: "bg-pink-500/20 text-pink-300",
    "AI/ML": "bg-purple-500/20 text-purple-300",
    "Data Science": "bg-amber-500/20 text-amber-300",
    Systems: "bg-red-500/20 text-red-300",
    "Automation/Scraping": "bg-cyan-500/20 text-cyan-300",
    General: "bg-slate-500/20 text-slate-300",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${colors[type] || colors.General}`}
    >
      {type}
    </span>
  );
}

export default function LocalScanView({ result, onReset }) {
  return (
    <div className="space-y-6">
      <button
        onClick={onReset}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Scan another directory
      </button>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <FolderOpen className="w-5 h-5 text-violet-400" />
          <h2 className="text-xl font-semibold text-white">
            {result.projects_found} Projects Found
          </h2>
        </div>
        <p className="text-slate-500 text-sm ml-8 font-mono">
          {result.directory}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-blue-400" />
            Languages ({result.all_languages.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.all_languages.map((lang, i) => (
              <Badge key={i} label={lang} variant="language" />
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-green-400" />
            Frameworks ({result.all_frameworks.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.all_frameworks.length > 0 ? (
              result.all_frameworks.map((fw, i) => (
                <Badge key={i} label={fw} variant="framework" />
              ))
            ) : (
              <p className="text-slate-500 text-sm">No frameworks detected</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-medium text-white">Projects</h3>
        {result.projects.map((project, i) => (
          <div
            key={i}
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <h4 className="font-medium text-white">{project.name}</h4>
                  <ProjectTypeIcon type={project.project_type} />
                  <Badge label={project.complexity} variant={project.complexity} />
                </div>
                {project.description && (
                  <p className="text-slate-400 text-sm mt-1">
                    {project.description}
                  </p>
                )}
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {project.files_count} files
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {project.languages.map((lang, j) => (
                <Badge key={`l-${j}`} label={lang} variant="language" />
              ))}
              {project.frameworks.map((fw, j) => (
                <Badge key={`f-${j}`} label={fw} variant="framework" />
              ))}
            </div>

            <div className="flex gap-4">
              <Indicator value={project.has_readme} label="README" />
              <Indicator value={project.has_tests} label="Tests" />
              <Indicator value={project.has_docker} label="Docker" />
              <Indicator value={project.has_ci} label="CI/CD" />
            </div>

            <p className="text-xs text-slate-600 font-mono truncate">
              {project.path}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
