"use client";
import React from "react";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Zap,
  Target,
  Sparkles,
  Brain,
  FileText,
} from "lucide-react";
import { useWorkflow } from "@/hooks/useWorkflow";
import TestCaseList from "@/components/TestCaseList";

interface StepperProps {
  sessionId: string;
}

export default function Stepper({ sessionId }: StepperProps) {
  const { currentStep, sessionDetails } = useWorkflow(sessionId);

  const getWorkflowSteps = () => [
    {
      id: "no-chat",
      title: "Fetch",
      icon: FileText,
      color:
        currentStep === "no-chat"
          ? "from-blue-500 to-cyan-500"
          : "from-gray-500 to-gray-600",
    },
    {
      id: "context-fetched",
      title: "Analyze",
      icon: Brain,
      color: ["context-fetched", "analyze"].includes(currentStep)
        ? "from-purple-500 to-pink-500"
        : "from-gray-500 to-gray-600",
    },
    {
      id: "edit-analysis",
      title: "Review",
      icon: Target,
      color:
        currentStep === "edit-analysis"
          ? "from-amber-500 to-orange-500"
          : "from-gray-500 to-gray-600",
    },
    {
      id: "generate-testcases",
      title: "Generate",
      icon: Sparkles,
      color: ["generate-testcases", "complete"].includes(currentStep)
        ? "from-green-500 to-emerald-500"
        : "from-gray-500 to-gray-600",
    },
  ];

  const isStepComplete = (stepId: string) => {
    const stepOrder = [
      "no-chat",
      "context-fetched",
      "analyze",
      "edit-analysis",
      "generate-testcases",
      "complete",
    ];

    const isRagContextLoaded =
      sessionDetails && sessionDetails.status === "rag-context_loaded";

    if (isRagContextLoaded && stepId === "no-chat") {
      return true;
    }

    return false;
  };

  const isStepActive = (stepId: string) => {
    return (
      currentStep === stepId ||
      (stepId === "context-fetched" && currentStep === "analyze") ||
      (stepId === "generate-testcases" && currentStep === "complete")
    );
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center space-x-6">
        {getWorkflowSteps().map((step, index) => {
          const StepIcon = step.icon;
          const isComplete = isStepComplete(step.id);
          const isActive = isStepActive(step.id);

          const stepIconClass = `w-4 h-4 ${
            isActive ? "text-white" : "text-slate-300"
          }`;
          const stepTitleClass = `text-xs font-medium ${
            isActive
              ? "text-white"
              : isComplete
              ? "text-green-300"
              : "text-slate-400"
          }`;
          const stepDivClass = `relative w-8 h-8 rounded-lg flex items-center justify-center shadow-md transition-all duration-200 \${isActive ? \`bg-gradient-to-br \${step.color} scale-105\` : isComplete ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-slate-700 hover:bg-slate-600"}`;
          const stepLineClass = `w-12 h-0.5 mx-3 transition-colors \${isComplete ? "bg-green-500" : "bg-slate-600"}`;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={stepDivClass}>
                  {isComplete ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <StepIcon className={stepIconClass} />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className={stepTitleClass}>{step.title}</div>
                </div>
              </div>

              {index < getWorkflowSteps().length - 1 && (
                <div className={stepLineClass} />
              )}
            </div>
          );
        })}
      </div>
      {sessionDetails && sessionDetails.status === "test_cases_generated" && (
        <TestCaseList testCases={sessionDetails.test_cases} />
      )}
    </div>
  );
}
