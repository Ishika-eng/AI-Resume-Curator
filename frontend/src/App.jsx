import { useState } from "react";
import axios from "axios";
import { Loader2, Sparkles } from "lucide-react";
import ResumeUpload from "./components/ResumeUpload";
import JobDescriptionInput from "./components/JobDescriptionInput";
import JobAnalysisView from "./components/JobAnalysisView";
import GitHubInput from "./components/GitHubInput";
import GitHubProfileView from "./components/GitHubProfileView";
import LocalScanInput from "./components/LocalScanInput";
import LocalScanView from "./components/LocalScanView";
import CurationView from "./components/CurationView";

const STEPS = ["resume", "job", "github", "local", "curate"];
const STEP_LABELS = ["Resume", "Job Desc", "GitHub", "Local", "Curate"];

function StepIndicator({ current }) {
  const currentIdx = STEPS.indexOf(current);
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {STEP_LABELS.map((label, i) => {
        const isActive = currentIdx === i;
        const isDone = currentIdx > i;
        return (
          <div key={i} className="flex items-center gap-1">
            {i > 0 && (
              <div
                className={`w-4 sm:w-8 h-px ${isDone ? "bg-violet-500" : "bg-slate-700"}`}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border ${
                  isActive
                    ? "border-violet-500 bg-violet-500/20 text-violet-300"
                    : isDone
                      ? "border-violet-500 bg-violet-500 text-white"
                      : "border-slate-600 bg-slate-800 text-slate-500"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </div>
              <span
                className={`text-xs hidden sm:inline ${
                  isActive ? "text-white" : "text-slate-500"
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CompletedBadge({ label, detail }) {
  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
      <div className="w-7 h-7 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 text-xs">
        ✓
      </div>
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-slate-500 text-xs">{detail}</p>
      </div>
    </div>
  );
}

function App() {
  const [step, setStep] = useState("resume");
  const [parsedResume, setParsedResume] = useState(null);
  const [jobAnalysis, setJobAnalysis] = useState(null);
  const [githubProfile, setGithubProfile] = useState(null);
  const [localScan, setLocalScan] = useState(null);
  const [curationResult, setCurationResult] = useState(null);
  const [curating, setCurating] = useState(false);

  const [viewingResults, setViewingResults] = useState(null);

  const handleResumeParsed = (data) => {
    setParsedResume(data);
    setStep("job");
  };

  const handleJobAnalyzed = (data) => {
    setJobAnalysis(data);
    setViewingResults("job");
  };

  const handleGithubAnalyzed = (data) => {
    setGithubProfile(data);
    setViewingResults("github");
  };

  const handleLocalScanned = (data) => {
    setLocalScan(data);
    setViewingResults("local");
  };

  const handleCurate = async () => {
    setCurating(true);
    setStep("curate");
    setViewingResults(null);

    try {
      const res = await axios.post("http://localhost:8000/api/curate", {
        resume: parsedResume,
        job_analysis: jobAnalysis,
        github_profile: githubProfile || null,
        local_scan: localScan || null,
      });
      setCurationResult(res.data);
    } catch (err) {
      console.error("Curation failed:", err);
    } finally {
      setCurating(false);
    }
  };

  const resetAll = () => {
    setParsedResume(null);
    setJobAnalysis(null);
    setGithubProfile(null);
    setLocalScan(null);
    setCurationResult(null);
    setCurating(false);
    setViewingResults(null);
    setStep("resume");
  };

  const completedBadges = () => {
    const badges = [];
    if (parsedResume) {
      badges.push(
        <CompletedBadge
          key="resume"
          label={parsedResume.filename}
          detail={`${parsedResume.sections.length} sections parsed`}
        />
      );
    }
    if (jobAnalysis) {
      badges.push(
        <CompletedBadge
          key="job"
          label={jobAnalysis.title || "Job Description"}
          detail={`${jobAnalysis.required_skills.length} required, ${jobAnalysis.ats_keywords.length} keywords`}
        />
      );
    }
    if (githubProfile) {
      badges.push(
        <CompletedBadge
          key="github"
          label={`GitHub: ${githubProfile.username}`}
          detail={`${githubProfile.skill_confidences.length} skills, ${githubProfile.repos_analyzed} repos`}
        />
      );
    }
    if (localScan) {
      badges.push(
        <CompletedBadge
          key="local"
          label="Local Projects"
          detail={`${localScan.projects_found} projects, ${localScan.all_frameworks.length} frameworks`}
        />
      );
    }
    return badges;
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            RC
          </div>
          <h1 className="text-xl font-semibold text-white">
            AI Resume Curator
          </h1>
          {parsedResume && (
            <button
              onClick={resetAll}
              className="ml-auto text-sm text-slate-400 hover:text-white transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <StepIndicator current={step} />

        {step === "resume" && (
          <ResumeUpload onParsed={handleResumeParsed} />
        )}

        {step === "job" && viewingResults !== "job" && (
          <div className="space-y-4">
            {completedBadges()}
            <JobDescriptionInput onAnalyzed={handleJobAnalyzed} />
          </div>
        )}
        {step === "job" && viewingResults === "job" && (
          <div className="space-y-6">
            <JobAnalysisView
              analysis={jobAnalysis}
              onReset={() => { setJobAnalysis(null); setViewingResults(null); }}
            />
            <button
              onClick={() => { setViewingResults(null); setStep("github"); }}
              className="w-full max-w-md mx-auto block bg-violet-600 hover:bg-violet-500 text-white font-medium py-3 rounded-xl transition-colors"
            >
              Continue to GitHub Analysis
            </button>
          </div>
        )}

        {step === "github" && viewingResults !== "github" && (
          <div className="space-y-4">
            {completedBadges()}
            <GitHubInput
              onAnalyzed={handleGithubAnalyzed}
              onSkip={() => { setViewingResults(null); setStep("local"); }}
            />
          </div>
        )}
        {step === "github" && viewingResults === "github" && (
          <div className="space-y-6">
            <GitHubProfileView
              profile={githubProfile}
              onReset={() => { setGithubProfile(null); setViewingResults(null); }}
            />
            <button
              onClick={() => { setViewingResults(null); setStep("local"); }}
              className="w-full max-w-md mx-auto block bg-violet-600 hover:bg-violet-500 text-white font-medium py-3 rounded-xl transition-colors"
            >
              Continue to Local Project Scan
            </button>
          </div>
        )}

        {step === "local" && viewingResults !== "local" && (
          <div className="space-y-4">
            {completedBadges()}
            <LocalScanInput
              onScanned={handleLocalScanned}
              onSkip={handleCurate}
            />
          </div>
        )}
        {step === "local" && viewingResults === "local" && (
          <div className="space-y-6">
            <LocalScanView
              result={localScan}
              onReset={() => { setLocalScan(null); setViewingResults(null); }}
            />
            <button
              onClick={handleCurate}
              className="w-full max-w-md mx-auto block bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Curate My Resume
            </button>
          </div>
        )}

        {step === "curate" && curating && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-violet-400 animate-spin" />
            <p className="text-slate-300 text-lg">Curating your resume...</p>
            <p className="text-slate-500 text-sm">
              Analyzing skills, rewriting bullets, scoring ATS compatibility
            </p>
          </div>
        )}

        {step === "curate" && !curating && curationResult && (
          <CurationView result={curationResult} />
        )}
      </main>
    </div>
  );
}

export default App;
