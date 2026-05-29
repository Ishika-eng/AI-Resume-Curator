import { FileText, Target, GitBranch, FolderSearch, Sparkles, ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";

function FeatureCard({ icon: Icon, title, desc, delay }) {
  return (
    <div className={`animate-fade-up ${delay} group p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300 hover:-translate-y-1`}>
      <div className="w-10 h-10 rounded-xl bg-[var(--accent-glow)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5 text-[var(--accent)]" />
      </div>
      <h3 className="text-[var(--text-primary)] font-semibold mb-2">{title}</h3>
      <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      <p className="text-xs text-[var(--text-muted)] mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function StepItem({ num, title, desc }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0">
        <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white text-sm font-semibold flex items-center justify-center">
          {num}
        </div>
        {num < 5 && <div className="w-px h-full bg-[var(--border)] mx-auto mt-2" />}
      </div>
      <div className="pb-8">
        <p className="text-[var(--text-primary)] font-medium">{title}</p>
        <p className="text-[var(--text-secondary)] text-sm mt-1">{desc}</p>
      </div>
    </div>
  );
}

export default function Landing({ onStart }) {
  return (
    <div className="relative">
      <div className="grain" />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--accent)] opacity-[0.04] rounded-full blur-[120px] pointer-events-none" />

      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-secondary)] mb-8">
            <Zap className="w-3 h-3 text-[var(--accent)]" />
            Free & open source
          </div>
        </div>

        <h1 className="animate-fade-up delay-100 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-[var(--text-primary)]">
          Your resume, curated by
          <span className="bg-gradient-to-r from-[var(--accent)] to-indigo-400 bg-clip-text text-transparent"> intelligence</span>
        </h1>

        <p className="animate-fade-up delay-200 mt-6 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          Upload your resume, paste a job description, and let the engine analyze your GitHub, local projects, and skills to produce an ATS-optimized resume tailored to the role.
        </p>

        <div className="animate-fade-up delay-300 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStart}
            className="group px-8 py-3.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 animate-glow"
          >
            Get started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="https://github.com/Ishika-eng/AI-Resume-Curator"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium rounded-xl border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-200"
          >
            View on GitHub
          </a>
        </div>

        <div className="animate-fade-up delay-400 mt-16 flex items-center justify-center gap-12">
          <Stat value="100+" label="Skills detected" />
          <div className="w-px h-8 bg-[var(--border)]" />
          <Stat value="7" label="Score dimensions" />
          <div className="w-px h-8 bg-[var(--border)]" />
          <Stat value="$0" label="Always free" />
        </div>
      </section>

      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Everything you need to stand out
          </h2>
          <p className="text-[var(--text-secondary)] mt-3 max-w-lg mx-auto">
            Not just another resume builder. A deep analysis engine that understands your actual skills.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard
            icon={FileText}
            title="Smart Resume Parsing"
            desc="Upload PDF or DOCX. Auto-detects sections, skills, experience, and structure."
            delay="delay-100"
          />
          <FeatureCard
            icon={Target}
            title="Job Description Analysis"
            desc="Extracts required skills, preferred skills, ATS keywords, and experience level."
            delay="delay-200"
          />
          <FeatureCard
            icon={GitBranch}
            title="GitHub Intelligence"
            desc="Scans your repos for languages, frameworks, and rates skill confidence from code evidence."
            delay="delay-300"
          />
          <FeatureCard
            icon={FolderSearch}
            title="Local Project Scanner"
            desc="Discovers projects on your machine — technologies, complexity, and frameworks you forgot to list."
            delay="delay-100"
          />
          <FeatureCard
            icon={Sparkles}
            title="AI Curation Engine"
            desc="Rewrites weak bullets, injects missing skills, and optimizes sections for ATS."
            delay="delay-200"
          />
          <FeatureCard
            icon={TrendingUp}
            title="Resume Scoring"
            desc="Scores across 7 dimensions — ATS compatibility, skill match, project relevance, and more."
            delay="delay-300"
          />
        </div>
      </section>

      <section className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            How it works
          </h2>
        </div>

        <div className="max-w-md mx-auto">
          <StepItem num={1} title="Upload your resume" desc="PDF or DOCX — we parse it into structured sections automatically." />
          <StepItem num={2} title="Paste the job description" desc="We extract required skills, keywords, and experience expectations." />
          <StepItem num={3} title="Connect GitHub" desc="Optional. We analyze your repos for skills missing from your resume." />
          <StepItem num={4} title="Scan local projects" desc="Optional. Point to a folder and we detect hidden technologies." />
          <StepItem num={5} title="Get your curated resume" desc="Rewritten bullets, missing skills surfaced, ATS score, and actionable recommendations." />
        </div>
      </section>

      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-24">
        <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-[var(--success)]" />
            <span className="text-sm text-[var(--text-secondary)]">Your data stays on your machine</span>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
            Ready to curate your resume?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
            No account needed. No data stored. Just upload, analyze, and get results.
          </p>
          <button
            onClick={onStart}
            className="group px-10 py-3.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            Start curating
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[var(--border)] py-8 text-center text-sm text-[var(--text-muted)]">
        <p>
          Built by{" "}
          <a href="https://github.com/Ishika-eng" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Ishika
          </a>
          {" "}&middot; Open source on{" "}
          <a href="https://github.com/Ishika-eng/AI-Resume-Curator" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
