"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  CheckCircle,
  Clock,
  FileText,
  Sparkles,
  Target,
  Edit3,
  Save,
  RotateCcw,
  Upload,
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

type WorkflowStep =
  | "fetch-context"
  | "analyze"
  | "edit-analysis"
  | "generate-tests"
  | "review-tests"
  | "export-ready";

export default function WorkflowChatInterface({
  sessionId,
}: WorkflowChatInterfaceProps) {
  const router = useRouter();

  // ✅ Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // State
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("fetch-context");
  const [showFetchModal, setShowFetchModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Data state
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [agentAnalysis, setAgentAnalysis] = useState("");
  const [sessionRequirements, setSessionRequirements] = useState("");

  // Test generation state
  const [testGenerationPrompt, setTestGenerationPrompt] = useState("");
  const [generatedTestCases, setGeneratedTestCases] = useState<TestCase[]>([]);
  const [editedTestCases, setEditedTestCases] = useState<TestCase[]>([]);
  const [isEditingTests, setIsEditingTests] = useState(false);

  // Load session details on mount
  useEffect(() => {
    loadSessionDetails();
  }, [sessionId]);

  // Determine workflow step based on session status
  useEffect(() => {
    if (sessionDetails) {
      const hasContext = sessionDetails.requirements.some(
        (r: any) => r.requirement_type === "rag_context"
      );
      const hasAnalysis = sessionDetails.status === "requirements_analyzed";
      const hasTests = sessionDetails.test_cases_count > 0;

      if (!hasContext) {
        setCurrentStep("fetch-context");
      } else if (!hasAnalysis) {
        setCurrentStep("analyze");
      } else if (!hasTests) {
        setCurrentStep("generate-tests");
      } else {
        setCurrentStep("export-ready");
        setGeneratedTestCases(sessionDetails.test_cases);
        setEditedTestCases(sessionDetails.test_cases);
      }
    }
  }, [sessionDetails]);

  const loadSessionDetails = async () => {
    try {
      const response = await getSessionDetails(sessionId);
      setSessionDetails(response);

      // Load requirements for analysis editing
      const filteredRequirements = response.requirements
        .filter((req: any) => req.requirement_type !== "rag_context")
        .map((req: any) => req.edited_content || req.original_content)
        .join("\n");
      setSessionRequirements(filteredRequirements);

      // Load analysis if exists
      const analysisReq = response.requirements.find(
        (r: any) =>
          r.requirement_type === "functional" ||
          r.requirement_type === "non_functional"
      );
      if (analysisReq) {
        setAgentAnalysis(analysisReq.original_content);
      }
    } catch (error) {
      console.error("Error loading session details:", error);
    }
  };

  // Step 1: Fetch Context
  const handleContextFetched = async (summary: string, prompt: string) => {
    setLoading(true);
    try {
      await fetchRAGContext(sessionId, prompt);
      setShowFetchModal(false);
      await loadSessionDetails();
      setCurrentStep("analyze");
    } catch (error) {
      console.error("Fetch context error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Analyze Requirements
  const handleAnalyzeData = async () => {
    if (!userPrompt.trim()) return;
    setLoading(true);
    try {
      const result = await analyzeRequirements(sessionId, userPrompt);
      setAgentAnalysis(result.analysis);
      await loadSessionDetails();
      setCurrentStep("edit-analysis");
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Save Analysis
  const handleSaveAnalysis = async () => {
    setLoading(true);
    try {
      await editRequirements(sessionId, [agentAnalysis]);
      await loadSessionDetails();
      setCurrentStep("generate-tests");
    } catch (error) {
      console.error("Save analysis error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Generate Test Cases
  const handleGenerateTests = async () => {
    if (!testGenerationPrompt.trim()) return;
    setLoading(true);
    try {
      const result = await generateTestCases(sessionId, testGenerationPrompt);
      setGeneratedTestCases(result.testCases);
      setEditedTestCases(result.testCases);
      await loadSessionDetails();
      setCurrentStep("review-tests");
    } catch (error) {
      console.error("Test generation error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Edit Tests
  const handleEditTest = (index: number, field: keyof TestCase, value: any) => {
    setEditedTestCases((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveTests = () => {
    setGeneratedTestCases(editedTestCases);
    setIsEditingTests(false);
    setCurrentStep("export-ready");
  };

  const handleResetTests = () => {
    setEditedTestCases(generatedTestCases);
    setIsEditingTests(false);
  };

  // Step 6: Export
  const handleExport = async () => {
    console.log("Exporting to ADO/Jira:", editedTestCases);
    alert("Export to ADO/Jira - Feature to be implemented");
  };

  // Workflow steps configuration
  const getWorkflowSteps = () => [
    {
      id: "fetch",
      title: "Fetch",
      icon: FileText,
      active: ["fetch-context", "analyze"].includes(currentStep),
      complete: sessionDetails?.requirements.some(
        (r: any) => r.requirement_type === "rag_context"
      ),
    },
    {
      id: "analyze",
      title: "Analyze",
      icon: Brain,
      active: ["analyze", "edit-analysis"].includes(currentStep),
      complete: sessionDetails?.status === "requirements_analyzed",
    },
    {
      id: "generate",
      title: "Generate",
      icon: Sparkles,
      active: ["generate-tests", "review-tests"].includes(currentStep),
      complete: generatedTestCases.length > 0,
    },
    {
      id: "export",
      title: "Export",
      icon: Upload,
      active: currentStep === "export-ready",
      complete: false,
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

      {/* Main Content - ✅ Width adjusts based on sidebar */}
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
                Healthcare Test Generation
              </h1>
              <p className="text-xs text-slate-400">
                Session: {sessionId.slice(-8)}
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4">
            {getWorkflowSteps().map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-200 ${
                        step.active
                          ? "bg-gradient-to-br from-blue-500 to-purple-600 scale-110"
                          : step.complete
                          ? "bg-gradient-to-br from-green-500 to-emerald-600"
                          : "bg-slate-700"
                      }`}
                    >
                      {step.complete ? (
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
                        step.active
                          ? "text-white"
                          : step.complete
                          ? "text-green-300"
                          : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < getWorkflowSteps().length - 1 && (
                    <div
                      className={`w-16 h-0.5 mx-2 transition-colors ${
                        step.complete ? "bg-green-500" : "bg-slate-700"
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
            {/* Step 1: Fetch Context */}
            {currentStep === "fetch-context" && (
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
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-2xl transition-all transform hover:-translate-y-1"
                >
                  Fetch Context
                </button>
              </div>
            )}

            {/* Step 2: Analyze Requirements */}
            {currentStep === "analyze" && (
              <div className="space-y-6">
                <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-6 h-6 text-purple-400" />
                    <h2 className="text-xl font-bold text-white">
                      Analyze Healthcare Requirements
                    </h2>
                  </div>
                  <p className="text-slate-400">
                    Provide a prompt for AI to analyze the fetched context
                  </p>
                </div>

                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="e.g., Analyze patient registration workflow for HIPAA compliance, security vulnerabilities, and edge cases..."
                  className="w-full p-6 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-base"
                />

                <button
                  onClick={handleAnalyzeData}
                  disabled={loading || !userPrompt.trim()}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
                >
                  {loading ? "Analyzing..." : "Analyze Requirements"}
                </button>
              </div>
            )}

            {/* Step 3: Edit Analysis */}
            {currentStep === "edit-analysis" && (
              <div className="space-y-6">
                <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Edit3 className="w-6 h-6 text-amber-400" />
                    <h2 className="text-xl font-bold text-white">
                      Review & Edit Analysis
                    </h2>
                  </div>
                  <p className="text-slate-400">
                    Review the AI-generated analysis and make edits if needed
                  </p>
                </div>

                <div className="p-6 bg-slate-800/50 border border-slate-700/30 rounded-2xl">
                  <h3 className="text-white font-semibold mb-3">
                    Requirements:
                  </h3>
                  <div className="text-slate-300 whitespace-pre-wrap mb-6 text-sm p-4 bg-slate-900/50 rounded-lg">
                    {sessionRequirements}
                  </div>

                  <h3 className="text-white font-semibold mb-3">
                    AI Analysis:
                  </h3>
                  <textarea
                    value={agentAnalysis}
                    onChange={(e) => setAgentAnalysis(e.target.value)}
                    className="w-full p-4 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-300 min-h-[300px] focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setAgentAnalysis(sessionRequirements)}
                    className="flex-1 px-6 py-3 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700 transition-all"
                  >
                    <RotateCcw className="w-4 h-4 inline mr-2" />
                    Reset
                  </button>
                  <button
                    onClick={handleSaveAnalysis}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl disabled:opacity-50 transition-all"
                  >
                    {loading ? "Saving..." : "Save & Continue"}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Generate Tests */}
            {currentStep === "generate-tests" && (
              <div className="space-y-6">
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
                />

                <button
                  onClick={handleGenerateTests}
                  disabled={loading || !testGenerationPrompt.trim()}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
                >
                  {loading ? "Generating Tests..." : "Generate Test Cases"}
                </button>
              </div>
            )}

            {/* Step 5: Review Tests */}
            {currentStep === "review-tests" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-slate-800/50 rounded-2xl border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <Target className="w-6 h-6 text-purple-400" />
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Review Generated Tests
                      </h2>
                      <p className="text-slate-400 text-sm">
                        {editedTestCases.length} test cases generated
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditingTests(!isEditingTests)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    {isEditingTests ? "Cancel Edit" : "Edit Tests"}
                  </button>
                </div>

                <TestCaseList testCases={editedTestCases} />

                <div className="flex gap-4">
                  {isEditingTests ? (
                    <>
                      <button
                        onClick={handleResetTests}
                        className="flex-1 px-6 py-3 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700 transition-all"
                      >
                        <RotateCcw className="w-4 h-4 inline mr-2" />
                        Reset Changes
                      </button>
                      <button
                        onClick={handleSaveTests}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
                      >
                        <Save className="w-4 h-4 inline mr-2" />
                        Save Tests
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setCurrentStep("export-ready")}
                      className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all text-lg"
                    >
                      Approve Tests
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 6: Export Ready */}
            {currentStep === "export-ready" && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">
                    Tests Ready for Export
                  </h2>
                  <p className="text-slate-400 text-lg mb-8">
                    {editedTestCases.length} approved test cases ready to export
                  </p>

                  <button
                    onClick={handleExport}
                    className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold hover:shadow-2xl transition-all transform hover:-translate-y-1 text-lg"
                  >
                    <Upload className="w-5 h-5 inline mr-2" />
                    Export to ADO/Jira
                  </button>
                </div>

                <TestCaseList testCases={editedTestCases} />
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
    </div>
  );
}
