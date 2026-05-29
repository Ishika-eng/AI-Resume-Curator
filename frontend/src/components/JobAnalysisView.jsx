import { ArrowLeft, Target, Star, Tag, BookOpen } from "lucide-react";

function SkillBadge({ skill }) {
  const colors = {
    languages: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    frameworks: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    databases: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    cloud_devops: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    ai_ml: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    tools: "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)]",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${colors[skill.category] || colors.tools}`}>
      {skill.name}
    </span>
  );
}

function Card({ icon: Icon, title, count, children }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-[var(--accent)]" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        {count !== undefined && <span className="text-xs text-[var(--text-muted)] ml-auto">{count}</span>}
      </div>
      {children}
    </div>
  );
}

export default function JobAnalysisView({ analysis, onReset }) {
  return (
    <div className="animate-fade-up space-y-5">
      <button onClick={onReset} className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Re-analyze
      </button>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{analysis.title || "Job Analysis"}</h2>
          {analysis.experience_level && (
            <span className="text-xs px-2 py-0.5 rounded-lg bg-[var(--accent-glow)] text-[var(--accent)] font-medium">{analysis.experience_level}</span>
          )}
        </div>
        {analysis.company && <p className="text-sm text-[var(--text-secondary)]">{analysis.company}</p>}
        <p className="text-xs text-[var(--text-muted)] mt-2">{analysis.match_summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card icon={Target} title="Required Skills" count={analysis.required_skills.length}>
          <div className="flex flex-wrap gap-1.5">
            {analysis.required_skills.length > 0
              ? analysis.required_skills.map((s, i) => <SkillBadge key={i} skill={s} />)
              : <p className="text-xs text-[var(--text-muted)]">None detected</p>}
          </div>
        </Card>
        <Card icon={Star} title="Preferred Skills" count={analysis.preferred_skills.length}>
          <div className="flex flex-wrap gap-1.5">
            {analysis.preferred_skills.length > 0
              ? analysis.preferred_skills.map((s, i) => <SkillBadge key={i} skill={s} />)
              : <p className="text-xs text-[var(--text-muted)]">None detected</p>}
          </div>
        </Card>
      </div>

      <Card icon={Tag} title="ATS Keywords" count={analysis.ats_keywords.length}>
        <div className="flex flex-wrap gap-1.5">
          {analysis.ats_keywords.map((kw, i) => (
            <span key={i} className="px-2.5 py-1 bg-[var(--bg-elevated)] text-[var(--text-secondary)] rounded-lg text-xs border border-[var(--border)]">{kw}</span>
          ))}
        </div>
      </Card>

      {analysis.responsibilities.length > 0 && (
        <Card icon={BookOpen} title="Responsibilities">
          <ul className="space-y-2">
            {analysis.responsibilities.map((r, i) => (
              <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2">
                <span className="text-[var(--text-muted)] shrink-0">&bull;</span> {r}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
