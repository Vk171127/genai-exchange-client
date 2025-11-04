// @/components/TestCaseCard.tsx
import { useState } from "react";
import { ChevronDown, CheckCircle2, AlertCircle, Circle } from "lucide-react";
import { TestCase } from "@/lib/types";

interface TestCaseCardProps {
  testCase: TestCase;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

const TestCaseCard = ({
  testCase,
  isSelected,
  onToggleSelect,
}: TestCaseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "Low":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High":
        return <AlertCircle className="w-3 h-3" />;
      case "Medium":
        return <Circle className="w-3 h-3" />;
      case "Low":
        return <CheckCircle2 className="w-3 h-3" />;
      default:
        return <Circle className="w-3 h-3" />;
    }
  };

  return (
    <div
      className={`rounded-xl border-2 transition-all duration-300 ${
        isSelected
          ? "bg-blue-500/5 border-blue-500/40 shadow-lg shadow-blue-500/10"
          : "bg-slate-800/40 border-slate-700/40 hover:border-slate-600/60"
      }`}
    >
      {/* Header Section */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <div className="flex items-center pt-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(testCase.id)}
              className="w-5 h-5 rounded-md border-2 border-slate-600 bg-slate-900 text-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-0 cursor-pointer transition-all"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* ID and Name */}
            <div className="flex items-start gap-3 mb-2">
              <span className="flex-shrink-0 px-2.5 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-xs font-mono font-semibold">
                #{testCase.id}
              </span>
              <h3 className="text-lg font-semibold text-white leading-tight">
                {testCase.test_name}
              </h3>
            </div>

            {/* Description */}
            <p className="text-slate-400 text-sm leading-relaxed mb-3">
              {testCase.test_description}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Priority Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold ${getPriorityStyles(
                  testCase.priority
                )}`}
              >
                {getPriorityIcon(testCase.priority)}
                {testCase.priority}
              </span>

              {/* Test Type Badge */}
              {testCase.test_type && (
                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-semibold">
                  {testCase.test_type}
                </span>
              )}
            </div>
          </div>

          {/* Expand Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 p-2 hover:bg-slate-700/50 rounded-lg transition-colors group"
            aria-label="Toggle details"
          >
            <ChevronDown
              className={`w-5 h-5 text-slate-400 group-hover:text-white transition-all duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Accordion Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-5 pt-2 border-t border-slate-700/40">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Test Steps */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wide flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                Test Steps
              </h4>
              <div className="space-y-2">
                {testCase.test_steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-colors"
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 text-blue-400 rounded-md flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Results */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wide flex items-center gap-2">
                <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                Expected Results
              </h4>
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                <p className="text-slate-300 text-sm leading-relaxed">
                  {testCase.expected_results}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCaseCard;
