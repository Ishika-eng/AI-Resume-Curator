import { ArrowLeft, Briefcase, Target, BookOpen, Star, Tag } from "lucide-react";

function SkillBadge({ skill }) {
  const colors = {
    languages: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    frameworks: "bg-green-500/20 text-green-300 border-green-500/30",
    databases: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    cloud_devops: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    ai_ml: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    tools: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${colors[skill.category] || colors.tools}`}
    >
      {skill.name}
    </span>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-violet-400" />
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function JobAnalysisView({ analysis, onReset }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Analyze another
        </button>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Briefcase className="w-5 h-5 text-violet-400" />
          <h2 className="text-xl font-semibold text-white">
            {analysis.title || "Job Analysis"}
          </h2>
          {analysis.experience_level && (
            <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full uppercase">
              {analysis.experience_level}
            </span>
          )}
        </div>
        {analysis.company && (
          <p className="text-slate-400 ml-8">{analysis.company}</p>
        )}
        <p className="text-slate-500 text-sm mt-2 ml-8">
          {analysis.match_summary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section icon={Target} title={`Required Skills (${analysis.required_skills.length})`}>
          <div className="flex flex-wrap gap-2">
            {analysis.required_skills.length > 0 ? (
              analysis.required_skills.map((skill, i) => (
                <SkillBadge key={i} skill={skill} />
              ))
            ) : (
              <p className="text-slate-500 text-sm">No explicit required skills detected</p>
            )}
          </div>
        </Section>

        <Section icon={Star} title={`Preferred Skills (${analysis.preferred_skills.length})`}>
          <div className="flex flex-wrap gap-2">
            {analysis.preferred_skills.length > 0 ? (
              analysis.preferred_skills.map((skill, i) => (
                <SkillBadge key={i} skill={skill} />
              ))
            ) : (
              <p className="text-slate-500 text-sm">No preferred skills section found</p>
            )}
          </div>
        </Section>
      </div>

      <Section icon={Tag} title={`ATS Keywords (${analysis.ats_keywords.length})`}>
        <div className="flex flex-wrap gap-2">
          {analysis.ats_keywords.map((kw, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm border border-slate-600/50"
            >
              {kw}
            </span>
          ))}
        </div>
      </Section>

      {analysis.responsibilities.length > 0 && (
        <Section icon={BookOpen} title="Key Responsibilities">
          <ul className="space-y-2">
            {analysis.responsibilities.map((r, i) => (
              <li key={i} className="text-slate-300 text-sm flex gap-2">
                <span className="text-violet-400 mt-1 shrink-0">•</span>
                {r}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {analysis.education_requirements.length > 0 && (
        <Section icon={BookOpen} title="Education Requirements">
          <ul className="space-y-1">
            {analysis.education_requirements.map((ed, i) => (
              <li key={i} className="text-slate-300 text-sm">
                {ed}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
