import { useState } from "react";
import {
  Target,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Sparkles,
  FileText,
  Tag,
} from "lucide-react";

function ScoreRing({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "var(--success)" : score >= 60 ? "var(--warning)" : "var(--danger)";

  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60" cy="60" r={radius}
          fill="none" stroke="var(--bg-elevated)" strokeWidth="8"
        />
        <circle
          cx="60" cy="60" r={radius}
          fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-[var(--text-primary)]">{score}</span>
        <span className="text-xs text-[var(--text-muted)]">/ 100</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, max, weight }) {
  const pct = (score / max) * 100;
  const color =
    pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="text-[var(--text-muted)]">
          {score}/{max} <span className="text-xs">({weight}%)</span>
        </span>
      </div>
      <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CollapsibleSection({ title, icon: Icon, count, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--bg-elevated)] transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <Icon className="w-4 h-4 text-[var(--accent)]" />
          <span className="font-medium text-[var(--text-primary)] text-sm">{title}</span>
          {count !== undefined && (
            <span className="text-xs bg-[var(--bg-elevated)] text-[var(--text-muted)] px-2 py-0.5 rounded-lg">
              {count}
            </span>
          )}
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
        )}
      </button>
      {open && <div className="px-5 pb-5 space-y-3">{children}</div>}
    </div>
  );
}

export default function CurationView({ result }) {
  const { scoring } = result;

  return (
    <div className="animate-fade-up space-y-5">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <Sparkles className="w-4 h-4 text-[var(--accent)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Curation Results</h2>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          <ScoreRing score={scoring.total} />
          <div className="flex-1 w-full space-y-3">
            <ScoreBar label="ATS Compatibility" score={scoring.ats_compatibility} max={25} weight={25} />
            <ScoreBar label="Skill Match" score={scoring.skill_match} max={20} weight={20} />
            <ScoreBar label="Project Relevance" score={scoring.project_relevance} max={20} weight={20} />
            <ScoreBar label="Resume Structure" score={scoring.resume_structure} max={10} weight={10} />
            <ScoreBar label="Keyword Optimization" score={scoring.keyword_optimization} max={10} weight={10} />
            <ScoreBar label="GitHub Strength" score={scoring.github_strength} max={10} weight={10} />
            <ScoreBar label="Technical Evidence" score={scoring.technical_evidence} max={5} weight={5} />
          </div>
        </div>
      </div>

      {result.rewritten_bullets.length > 0 && (
        <CollapsibleSection
          title="Rewritten Bullet Points"
          icon={Sparkles}
          count={result.rewritten_bullets.length}
          defaultOpen={true}
        >
          {result.rewritten_bullets.map((rb, i) => (
            <div key={i} className="bg-[var(--bg-elevated)] rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-[var(--danger)] text-xs mt-0.5 shrink-0 font-medium">BEFORE</span>
                <p className="text-[var(--text-muted)] text-sm line-through">{rb.original}</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[var(--success)] text-xs mt-0.5 shrink-0 font-medium">AFTER</span>
                <p className="text-emerald-400 text-sm">{rb.rewritten}</p>
              </div>
              <p className="text-xs text-[var(--text-muted)] ml-14">{rb.reason}</p>
            </div>
          ))}
        </CollapsibleSection>
      )}

      {result.missing_skills.length > 0 && (
        <CollapsibleSection
          title="Missing Skills"
          icon={AlertTriangle}
          count={result.missing_skills.length}
          defaultOpen={true}
        >
          <div className="space-y-2">
            {result.missing_skills.map((ms, i) => {
              const borderColor =
                ms.confidence === "high"
                  ? "border-l-[var(--danger)]"
                  : ms.confidence === "medium"
                    ? "border-l-[var(--warning)]"
                    : "border-l-[var(--text-muted)]";
              return (
                <div
                  key={i}
                  className={`bg-[var(--bg-elevated)] rounded-lg p-3 border-l-4 ${borderColor}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[var(--text-primary)] font-medium text-sm">{ms.name}</span>
                    <span className="text-xs text-[var(--text-muted)]">{ms.source}</span>
                  </div>
                  <p className="text-[var(--text-secondary)] text-xs">{ms.suggestion}</p>
                </div>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      {result.missing_projects.length > 0 && (
        <CollapsibleSection
          title="Projects to Add"
          icon={FolderOpen}
          count={result.missing_projects.length}
        >
          {result.missing_projects.map((mp, i) => (
            <div key={i} className="bg-[var(--bg-elevated)] rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-primary)] text-sm font-medium">{mp.name}</span>
                  <span className="text-xs text-[var(--text-muted)]">{mp.source}</span>
                </div>
                <div className="flex gap-1.5 mt-1.5">
                  {mp.languages.map((l, j) => (
                    <span key={j} className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                      {l}
                    </span>
                  ))}
                  {mp.frameworks.map((f, j) => (
                    <span key={j} className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-lg ${
                  mp.relevance === "high"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : mp.relevance === "medium"
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                }`}
              >
                {mp.relevance}
              </span>
            </div>
          ))}
        </CollapsibleSection>
      )}

      {result.added_keywords.length > 0 && (
        <CollapsibleSection
          title="Keywords Added"
          icon={Tag}
          count={result.added_keywords.length}
        >
          <div className="flex flex-wrap gap-1.5">
            {result.added_keywords.map((kw, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-[var(--accent-glow)] text-[var(--accent)] rounded-lg text-xs border border-[var(--border)]"
              >
                + {kw}
              </span>
            ))}
          </div>
        </CollapsibleSection>
      )}

      <CollapsibleSection
        title="Curated Resume Sections"
        icon={FileText}
        count={result.curated_sections.length}
      >
        {result.curated_sections.map((section, i) => (
          <div key={i} className="bg-[var(--bg-elevated)] rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[var(--text-primary)] font-medium text-sm">{section.title}</h4>
              {section.changes.length > 0 && (
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg">
                  {section.changes.length} change{section.changes.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            {section.content.map((line, j) => (
              <p key={j} className="text-[var(--text-secondary)] text-sm">{line}</p>
            ))}
            {section.changes.map((change, j) => (
              <p key={`c-${j}`} className="text-xs text-emerald-400/70 flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> {change}
              </p>
            ))}
          </div>
        ))}
      </CollapsibleSection>

      <CollapsibleSection
        title="Recommendations"
        icon={Lightbulb}
        count={result.recommendations.length}
        defaultOpen={true}
      >
        <div className="space-y-2">
          {result.recommendations.map((rec, i) => (
            <div key={i} className="flex gap-3 bg-[var(--bg-elevated)] rounded-lg p-3">
              <span className="text-[var(--accent)] font-medium text-sm shrink-0">
                {i + 1}.
              </span>
              <p className="text-[var(--text-secondary)] text-sm">{rec}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}
