import { ArrowLeft, Star, GitFork, Users, Code, ExternalLink } from "lucide-react";

function LanguageBar({ languages }) {
  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  if (!total) return null;
  const colors = {
    Python: "#3572A5", JavaScript: "#f1e05a", TypeScript: "#3178c6", Java: "#b07219",
    "C++": "#f34b7d", "C#": "#178600", Go: "#00ADD8", Rust: "#dea584", Ruby: "#701516",
    PHP: "#4F5D95", Swift: "#F05138", Kotlin: "#A97BFF", HTML: "#e34c26", CSS: "#563d7c",
    Shell: "#89e051", Dart: "#00B4AB",
  };
  const entries = Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 8);
  return (
    <div className="space-y-3">
      <div className="flex h-2.5 rounded-full overflow-hidden bg-[var(--bg-elevated)]">
        {entries.map(([lang, bytes]) => (
          <div key={lang} style={{ width: `${(bytes / total) * 100}%`, backgroundColor: colors[lang] || "#6b7280" }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {entries.map(([lang, bytes]) => (
          <span key={lang} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[lang] || "#6b7280" }} />
            {lang} <span className="text-[var(--text-muted)]">{((bytes / total) * 100).toFixed(1)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function ConfidenceDot({ level }) {
  const c = { high: "bg-emerald-400", medium: "bg-amber-400", low: "bg-[var(--text-muted)]" };
  return <span className={`w-2 h-2 rounded-full ${c[level]}`} />;
}

export default function GitHubProfileView({ profile, onReset }) {
  return (
    <div className="animate-fade-up space-y-5">
      <button onClick={onReset} className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Re-analyze
      </button>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 flex items-start gap-4">
        {profile.avatar_url && <img src={profile.avatar_url} alt="" className="w-14 h-14 rounded-xl border border-[var(--border)]" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] truncate">{profile.name || profile.username}</h2>
            <span className="text-xs px-2 py-0.5 rounded-lg bg-[var(--accent-glow)] text-[var(--accent)] font-medium shrink-0">{profile.activity_level}</span>
          </div>
          {profile.bio && <p className="text-sm text-[var(--text-secondary)] mt-1 truncate">{profile.bio}</p>}
          <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1"><Code className="w-3.5 h-3.5" /> {profile.public_repos} repos</span>
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {profile.total_stars} stars</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {profile.followers} followers</span>
            <a href={profile.profile_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[var(--accent)] transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Profile
            </a>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Languages</h3>
        <LanguageBar languages={profile.language_breakdown} />
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Skill Confidence</h3>
        <div className="space-y-1.5">
          {profile.skill_confidences.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-[var(--bg-elevated)]">
              <div className="flex items-center gap-2.5">
                <ConfidenceDot level={s.confidence} />
                <span className="text-sm text-[var(--text-primary)]">{s.name}</span>
                <span className="text-xs text-[var(--text-muted)]">{s.category}</span>
              </div>
              <span className="text-xs text-[var(--text-muted)]">{s.evidence_count} repo{s.evidence_count !== 1 && "s"}</span>
            </div>
          ))}
        </div>
      </div>

      {profile.frameworks_detected.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Frameworks Detected</h3>
          <div className="flex flex-wrap gap-1.5">
            {profile.frameworks_detected.map((fw, i) => (
              <span key={i} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs border border-emerald-500/20">{fw}</span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Top Repositories</h3>
        <div className="space-y-2">
          {profile.top_repos.map((repo, i) => (
            <div key={i} className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline text-sm font-medium flex items-center gap-1">
                  {repo.name} <ExternalLink className="w-3 h-3" />
                </a>
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                  {repo.stars > 0 && <span className="flex items-center gap-1"><Star className="w-3 h-3" />{repo.stars}</span>}
                  {repo.forks > 0 && <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{repo.forks}</span>}
                </div>
              </div>
              {repo.description && <p className="text-xs text-[var(--text-muted)] mt-1">{repo.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
