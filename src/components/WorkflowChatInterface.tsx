"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  CheckCircle,
  FileText,
  Sparkles,
  Edit3,
  RotateCcw,
  Upload,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import FetchContextModal from "@/components/FetchContextModal";
import TestCaseList from "@/components/TestCaseList";
import {
  getSessionDetails,
  fetchRAGContext,
  analyzeRequirements,
  editRequirements,
  generateTestCases,
} from "@/lib/api";
import Link from "next/link";

export interface TestCase {
  id: string;
  session_id: string;
  test_name: string;
  test_description: string;
  test_steps: string[];
  expected_results: string;
  test_type: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  linked_requirements: string[];
}

export interface WorkflowChatInterfaceProps {
  sessionId: string;
}

type SessionStatus =
  | "in_progress"
  | "rag_context_loaded"
  | "requirements_analyzed"
  | "test_cases_generated"
  | "completed";

type WorkflowStep = "fetch" | "analyze" | "generate" | "export";
type SubStep = "input" | "processing" | "review";

export default function WorkflowChatInterface({
  sessionId,
}: WorkflowChatInterfaceProps) {
  const router = useRouter();

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Session state
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [sessionStatus, setSessionStatus] =
    useState<SessionStatus>("in_progress");
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("fetch");
  const [currentSubStep, setCurrentSubStep] = useState<SubStep>("input");
  const [loading, setLoading] = useState(false);

  // Fetch Context state
  const [showFetchModal, setShowFetchModal] = useState(false);

  // Analyze state
  const [analysisPrompt, setAnalysisPrompt] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [editedAnalysis, setEditedAnalysis] = useState("");

  // Test Generation state
  const [testGenerationPrompt, setTestGenerationPrompt] = useState("");
  const [generatedTestCases, setGeneratedTestCases] = useState<TestCase[]>([]);
  const [editedTestCases, setEditedTestCases] = useState<TestCase[]>([]);
  const [selectedTestIds, setSelectedTestIds] = useState<Set<string>>(
    new Set()
  );

  // Export state
  const [showExportModal, setShowExportModal] = useState(false);

  // Load session details on mount
  useEffect(() => {
    loadSessionDetails();
  }, [sessionId]);

  const loadSessionDetails = async () => {
    try {
      const response = await getSessionDetails(sessionId);
      setSessionDetails(response);
      setSessionStatus(response.status as SessionStatus);

      // Determine current step based on status
      determineCurrentStep(response.status as SessionStatus, response);
    } catch (error) {
      console.error("Error loading session details:", error);
    }
  };

  const determineCurrentStep = (status: SessionStatus, details: any) => {
    switch (status) {
      case "in_progress":
        setCurrentStep("fetch");
        setCurrentSubStep("input");
        break;

      case "rag_context_loaded":
        setCurrentStep("analyze");
        setCurrentSubStep("input");
        break;

      case "requirements_analyzed":
        // Load the analysis for display
        const analysisReq = details.requirements.find(
          (r: any) =>
            r.requirement_type === "functional" ||
            r.requirement_type === "non_functional"
        );
        if (analysisReq) {
          setAnalysisResult(analysisReq.original_content);
          setEditedAnalysis(
            analysisReq.edited_content || analysisReq.original_content
          );
        }
        setCurrentStep("generate");
        setCurrentSubStep("input");
        break;

      case "test_cases_generated":
        // Load test cases if available
        if (details.test_cases && details.test_cases.length > 0) {
          setGeneratedTestCases(details.test_cases);
          setEditedTestCases(details.test_cases);
          // Select all by default
          const allIds = new Set<string>(
            details.test_cases.map((tc: TestCase) => tc.id)
          );
          setSelectedTestIds(allIds);
        }
        setCurrentStep("export");
        setCurrentSubStep("input");
        break;

      case "completed":
        setCurrentStep("export");
        setCurrentSubStep("review");
        break;

      default:
        setCurrentStep("fetch");
        setCurrentSubStep("input");
    }
  };

  // ==================== STEP 1: FETCH CONTEXT ====================
  const handleContextFetched = async (summary: string, prompt: string) => {
    setLoading(true);
    setCurrentSubStep("processing");
    try {
      await fetchRAGContext(sessionId, prompt);
      setShowFetchModal(false);
      await loadSessionDetails();
      setCurrentStep("analyze");
      setCurrentSubStep("input");
    } catch (error) {
      console.error("Fetch context error:", error);
      setCurrentSubStep("input");
    } finally {
      setLoading(false);
    }
  };

  // ==================== STEP 2: ANALYZE REQUIREMENTS ====================
  const handleAnalyzeRequirements = async () => {
    if (!analysisPrompt.trim()) return;

    setLoading(true);
    setCurrentSubStep("processing");
    try {
      const result = await analyzeRequirements(sessionId, analysisPrompt);
      setAnalysisResult(result.analysis);
      setEditedAnalysis(result.analysis);
      setCurrentSubStep("review");
    } catch (error) {
      console.error("Analysis error:", error);
      setCurrentSubStep("input");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnalysis = async () => {
    setLoading(true);
    try {
      await editRequirements(sessionId, [editedAnalysis]);
      await loadSessionDetails();
      setCurrentStep("generate");
      setCurrentSubStep("input");
    } catch (error) {
      console.error("Save analysis error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateAnalysis = () => {
    setAnalysisPrompt("");
    setAnalysisResult("");
    setEditedAnalysis("");
    setCurrentSubStep("input");
  };

  // ==================== STEP 3: GENERATE TEST CASES ====================
  const handleGenerateTestCases = async () => {
    if (!testGenerationPrompt.trim()) return;

    setLoading(true);
    setCurrentSubStep("processing");
    try {
      const result = await generateTestCases(sessionId, testGenerationPrompt);
      setGeneratedTestCases(result.testCases);
      setEditedTestCases(result.testCases);
      // Select all by default
      const allIds = new Set(result.testCases.map((tc: TestCase) => tc.id));
      setSelectedTestIds(allIds);
      setCurrentSubStep("review");
    } catch (error) {
      console.error("Test generation error:", error);
      setCurrentSubStep("input");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTestCase = (
    index: number,
    field: keyof TestCase,
    value: any
  ) => {
    setEditedTestCases((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRegenerateTests = () => {
    setTestGenerationPrompt("");
    setGeneratedTestCases([]);
    setEditedTestCases([]);
    setSelectedTestIds(new Set());
    setCurrentSubStep("input");
  };

  const handleContinueToExport = () => {
    setCurrentStep("export");
    setCurrentSubStep("input");
  };

  // ==================== STEP 4: EXPORT ====================
  const handleToggleTestSelection = (testId: string) => {
    setSelectedTestIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(testId)) {
        newSet.delete(testId);
      } else {
        newSet.add(testId);
      }
      return newSet;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedTestIds.size === editedTestCases.length) {
      setSelectedTestIds(new Set());
    } else {
      const allIds = new Set(editedTestCases.map((tc) => tc.id));
      setSelectedTestIds(allIds);
    }
  };

  const handleExportConfirm = async () => {
    // TODO: Implement actual export API call
    console.log("Exporting test cases:", Array.from(selectedTestIds));

    // Simulate export
    setLoading(true);
    try {
      // await exportTestCases(sessionId, Array.from(selectedTestIds));
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call

      // Update status to completed
      setSessionStatus("completed");
      setShowExportModal(false);
      alert(
        `Successfully exported ${selectedTestIds.size} test cases to ADO/Jira!`
      );
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export test cases. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ==================== PROGRESS STEPS ====================
  const getProgressSteps = () => [
    {
      id: "fetch",
      title: "Fetch",
      icon: FileText,
      completed: [
        "rag_context_loaded",
        "requirements_analyzed",
        "test_cases_generated",
        "completed",
      ].includes(sessionStatus),
      active: currentStep === "fetch",
    },
    {
      id: "analyze",
      title: "Analyze",
      icon: Brain,
      completed: [
        "requirements_analyzed",
        "test_cases_generated",
        "completed",
      ].includes(sessionStatus),
      active: currentStep === "analyze",
    },
    {
      id: "generate",
      title: "Generate",
      icon: Sparkles,
      completed: ["test_cases_generated", "completed"].includes(sessionStatus),
      active: currentStep === "generate",
    },
    {
      id: "export",
      title: "Export",
      icon: Upload,
      completed: sessionStatus === "completed",
      active: currentStep === "export",
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <Sidebar
        sessionId={sessionId}
        isOpen={sidebarOpen}
        onToggle={setSidebarOpen}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-72" : "ml-12"
        }`}
      >
        {/* Header */}
        <header className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-700/40 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-bold text-white">
                {sessionDetails?.project_name || "Loading..."}
              </h1>
              <p className="text-xs text-slate-400">
                Session: {sessionId.slice(8)}
              </p>
              {sessionDetails?.alm_tool && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-blue-400 font-medium">
                    {sessionDetails.alm_tool}
                  </span>
                </>
              )}
            </div>
            <Link
              href="/dashboard"
              className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Dashboard
            </Link>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4">
            {getProgressSteps().map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 ${
                        step.completed
                          ? "bg-gradient-to-br from-green-500 to-emerald-600 scale-105"
                          : step.active
                          ? "bg-gradient-to-br from-blue-500 to-purple-600 scale-110"
                          : "bg-slate-700"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <StepIcon
                          className={`w-5 h-5 ${
                            step.active ? "text-white" : "text-slate-400"
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        step.completed
                          ? "text-green-400"
                          : step.active
                          ? "text-white"
                          : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < getProgressSteps().length - 1 && (
                    <div
                      className={`w-16 h-0.5 mx-2 transition-colors duration-300 ${
                        step.completed ? "bg-green-500" : "bg-slate-700"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* ==================== FETCH CONTEXT STEP ==================== */}
            {currentStep === "fetch" && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Fetch Healthcare Context
                </h2>
                <p className="text-slate-400 text-lg mb-8">
                  Start by retrieving relevant context for your healthcare
                  application
                </p>
                <button
                  onClick={() => setShowFetchModal(true)}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-2xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    "Fetch Context"
                  )}
                </button>
              </div>
            )}

            {/* ==================== ANALYZE STEP ==================== */}
            {currentStep === "analyze" && (
              <div className="space-y-6">
                {/* Sub-step: Input */}
                {currentSubStep === "input" && (
                  <>
                    <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                      <div className="flex items-center gap-3 mb-4">
                        <Brain className="w-6 h-6 text-purple-400" />
                        <h2 className="text-xl font-bold text-white">
                          Analyze Healthcare Requirements
                        </h2>
                      </div>
                      <p className="text-slate-400">
                        Provide instructions for AI to analyze the fetched
                        context
                      </p>
                    </div>

                    <textarea
                      value={analysisPrompt}
                      onChange={(e) => setAnalysisPrompt(e.target.value)}
                      placeholder="e.g., Analyze patient registration workflow for HIPAA compliance, security vulnerabilities, and edge cases..."
                      className="w-full p-6 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-base"
                      disabled={loading}
                    />

                    <button
                      onClick={handleAnalyzeRequirements}
                      disabled={loading || !analysisPrompt.trim()}
                      className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analyzing Requirements...
                        </>
                      ) : (
                        "Analyze Requirements"
                      )}
                    </button>
                  </>
                )}

                {/* Sub-step: Review & Edit */}
                {currentSubStep === "review" && (
                  <>
                    <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Edit3 className="w-6 h-6 text-amber-400" />
                          <h2 className="text-xl font-bold text-white">
                            Review & Edit Analysis
                          </h2>
                        </div>
                        <button
                          onClick={handleRegenerateAnalysis}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Regenerate
                        </button>
                      </div>
                      <p className="text-slate-400">
                        Review and edit the AI-generated analysis before
                        continuing
                      </p>
                    </div>

                    <div className="p-6 bg-slate-800/50 border border-slate-700/30 rounded-2xl">
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-400" />
                        Analysis Result:
                      </h3>
                      <textarea
                        value={editedAnalysis}
                        onChange={(e) => setEditedAnalysis(e.target.value)}
                        className="w-full p-4 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-300 min-h-[350px] focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm font-mono"
                        disabled={loading}
                      />
                    </div>

                    <button
                      onClick={handleSaveAnalysis}
                      disabled={loading || !editedAnalysis.trim()}
                      className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Save & Continue to Generate Tests
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ==================== GENERATE TEST CASES STEP ==================== */}
            {currentStep === "generate" && (
              <div className="space-y-6">
                {/* Sub-step: Input */}
                {currentSubStep === "input" && (
                  <>
                    <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-6 h-6 text-green-400" />
                        <h2 className="text-xl font-bold text-white">
                          Generate Test Cases
                        </h2>
                      </div>
                      <p className="text-slate-400">
                        Specify what type of test cases you want to generate
                      </p>
                    </div>

                    <textarea
                      value={testGenerationPrompt}
                      onChange={(e) => setTestGenerationPrompt(e.target.value)}
                      placeholder="e.g., Generate comprehensive functional test cases for patient login module including security and edge cases..."
                      className="w-full p-6 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 text-base"
                      disabled={loading}
                    />

                    <button
                      onClick={handleGenerateTestCases}
                      disabled={loading || !testGenerationPrompt.trim()}
                      className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Generating Test Cases...
                        </>
                      ) : (
                        "Generate Test Cases"
                      )}
                    </button>
                  </>
                )}

                {/* Sub-step: Review & Edit */}
                {currentSubStep === "review" && (
                  <>
                    <div className="flex items-center justify-between p-6 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-green-400" />
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            Review Generated Test Cases
                          </h2>
                          <p className="text-slate-400 text-sm">
                            {editedTestCases.length} test cases generated
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRegenerateTests}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Regenerate
                      </button>
                    </div>

                    <TestCaseList testCases={editedTestCases} />

                    <button
                      onClick={handleContinueToExport}
                      disabled={editedTestCases.length === 0}
                      className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Continue to Export
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ==================== EXPORT STEP ==================== */}
            {currentStep === "export" && sessionStatus !== "completed" && (
              <div className="space-y-6">
                <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Upload className="w-6 h-6 text-amber-400" />
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          Export Test Cases
                        </h2>
                        <p className="text-slate-400 text-sm">
                          Select test cases to export to ADO/Jira
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleToggleSelectAll}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
                    >
                      {selectedTestIds.size === editedTestCases.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>
                </div>

                {/* Test Case Selection List */}
                <div className="space-y-3">
                  {editedTestCases.map((testCase) => (
                    <div
                      key={testCase.id}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedTestIds.has(testCase.id)
                          ? "bg-blue-500/10 border-blue-500/50"
                          : "bg-slate-800/50 border-slate-700/30 hover:border-slate-600"
                      }`}
                      onClick={() => handleToggleTestSelection(testCase.id)}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedTestIds.has(testCase.id)}
                          onChange={() =>
                            handleToggleTestSelection(testCase.id)
                          }
                          className="mt-1 w-5 h-5 rounded border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">
                            {testCase.test_name}
                          </h3>
                          <p className="text-slate-400 text-sm">
                            {testCase.test_description}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                              {testCase.test_type}
                            </span>
                            <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                              {testCase.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowExportModal(true)}
                  disabled={selectedTestIds.size === 0 || loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Export {selectedTestIds.size} Test Case
                  {selectedTestIds.size !== 1 ? "s" : ""} to ADO/Jira
                </button>
              </div>
            )}

            {/* ==================== COMPLETED STATE ==================== */}
            {sessionStatus === "completed" && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Export Completed!
                </h2>
                <p className="text-slate-400 text-lg mb-8">
                  Test cases have been successfully exported to ADO/Jira
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Dashboard
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Fetch Context Modal */}
      <FetchContextModal
        isOpen={showFetchModal}
        onClose={() => setShowFetchModal(false)}
        onContextFetched={handleContextFetched}
        sessionId={sessionId}
        loading={loading}
      />

      {/* Export Confirmation Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Confirm Export</h3>
                <p className="text-slate-400 text-sm">
                  This action will export test cases
                </p>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
              <p className="text-slate-300 text-sm">
                Are you sure you want to export{" "}
                <span className="text-amber-400 font-semibold">
                  {selectedTestIds.size}
                </span>{" "}
                test case{selectedTestIds.size !== 1 ? "s" : ""} to ADO/Jira?
              </p>
              <p className="text-slate-500 text-xs mt-2">
                This will mark the session as completed.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExportConfirm}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Export Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
