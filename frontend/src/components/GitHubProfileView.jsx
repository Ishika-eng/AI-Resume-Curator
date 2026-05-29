import {
  ArrowLeft,
  GitBranch,
  Star,
  GitFork,
  Users,
  Code,
  ExternalLink,
} from "lucide-react";

function LanguageBar({ languages }) {
  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  if (!total) return null;

  const colors = {
    Python: "#3572A5",
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Java: "#b07219",
    "C++": "#f34b7d",
    "C#": "#178600",
    Go: "#00ADD8",
    Rust: "#dea584",
    Ruby: "#701516",
    PHP: "#4F5D95",
    Swift: "#F05138",
    Kotlin: "#A97BFF",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Shell: "#89e051",
    Dart: "#00B4AB",
  };

  const entries = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="space-y-3">
      <div className="flex h-3 rounded-full overflow-hidden">
        {entries.map(([lang, bytes]) => (
          <div
            key={lang}
            style={{
              width: `${(bytes / total) * 100}%`,
              backgroundColor: colors[lang] || "#6b7280",
            }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {entries.map(([lang, bytes]) => (
          <span key={lang} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: colors[lang] || "#6b7280" }}
            />
            {lang}{" "}
            <span className="text-slate-600">
              {((bytes / total) * 100).toFixed(1)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function ConfidenceBadge({ level }) {
  const styles = {
    high: "bg-green-500/20 text-green-300 border-green-500/30",
    medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    low: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full border ${styles[level]}`}
    >
      {level}
    </span>
  );
}

export default function GitHubProfileView({ profile, onReset }) {
  return (
    <div className="space-y-6">
      <button
        onClick={onReset}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Analyze another
      </button>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex items-start gap-5">
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="w-16 h-16 rounded-full border-2 border-slate-600"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white">
              {profile.name || profile.username}
            </h2>
            <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">
              {profile.activity_level}
            </span>
          </div>
          {profile.bio && (
            <p className="text-slate-400 text-sm mt-1">{profile.bio}</p>
          )}
          <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Code className="w-4 h-4" /> {profile.public_repos} repos
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" /> {profile.total_stars} stars
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" /> {profile.followers} followers
            </span>
            <a
              href={profile.profile_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-violet-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Profile
            </a>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Code className="w-5 h-5 text-violet-400" />
          Language Breakdown
        </h3>
        <LanguageBar languages={profile.language_breakdown} />
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-white">
          Skill Confidence ({profile.skill_confidences.length})
        </h3>
        <div className="space-y-2">
          {profile.skill_confidences.map((skill, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 px-3 bg-slate-800/80 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-white text-sm font-medium w-32">
                  {skill.name}
                </span>
                <span className="text-xs text-slate-500">{skill.category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  {skill.evidence_count} repo{skill.evidence_count !== 1 && "s"}
                </span>
                <ConfidenceBadge level={skill.confidence} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {profile.frameworks_detected.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-white">Frameworks Detected</h3>
          <div className="flex flex-wrap gap-2">
            {profile.frameworks_detected.map((fw, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-green-500/15 text-green-300 rounded-full text-sm border border-green-500/30"
              >
                {fw}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-violet-400" />
          Top Repositories ({profile.repos_analyzed})
        </h3>
        <div className="space-y-3">
          {profile.top_repos.map((repo, i) => (
            <div
              key={i}
              className="p-4 bg-slate-800/80 rounded-lg border border-slate-700/50 space-y-2"
            >
              <div className="flex items-start justify-between">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 font-medium text-sm flex items-center gap-1"
                >
                  {repo.name}
                  <ExternalLink className="w-3 h-3" />
                </a>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {repo.stars > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" /> {repo.stars}
                    </span>
                  )}
                  {repo.forks > 0 && (
                    <span className="flex items-center gap-1">
                      <GitFork className="w-3 h-3" /> {repo.forks}
                    </span>
                  )}
                </div>
              </div>
              {repo.description && (
                <p className="text-slate-400 text-xs">{repo.description}</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {repo.primary_language && (
                  <span className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded">
                    {repo.primary_language}
                  </span>
                )}
                {repo.topics.slice(0, 5).map((topic, j) => (
                  <span
                    key={j}
                    className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-500 rounded"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
