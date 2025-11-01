import { Session } from "@/lib/types";
import {
  Activity,
  BarChart3,
  CheckCircle,
  Clock,
  Sparkles,
  Brain,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export function SessionCard({ session }: { session: Session }) {
  const router = useRouter();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "in_progress":
        return {
          label: "In Progress",
          color: "from-blue-500 to-cyan-500",
          textColor: "text-blue-300",
          bgColor: "bg-blue-500/10",
          icon: Activity,
        };
      case "rag_context_loaded":
        return {
          label: "Context Loaded",
          color: "from-purple-500 to-indigo-500",
          textColor: "text-purple-300",
          bgColor: "bg-purple-500/10",
          icon: FileText,
        };
      case "requirements_analyzed":
        return {
          label: "Analyzed",
          color: "from-amber-500 to-orange-500",
          textColor: "text-amber-300",
          bgColor: "bg-amber-500/10",
          icon: Brain,
        };
      case "test_cases_generated":
        return {
          label: "Tests Generated",
          color: "from-green-500 to-emerald-500",
          textColor: "text-green-300",
          bgColor: "bg-green-500/10",
          icon: Sparkles,
        };
      case "completed":
        return {
          label: "Completed",
          color: "from-green-600 to-emerald-600",
          textColor: "text-green-300",
          bgColor: "bg-green-500/10",
          icon: CheckCircle,
        };
      default:
        return {
          label: status,
          color: "from-gray-500 to-gray-600",
          textColor: "text-gray-300",
          bgColor: "bg-gray-500/10",
          icon: Clock,
        };
    }
  };

  const statusConfig = getStatusConfig(session.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors line-clamp-1">
            {session.project_name}
          </h3>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 ${statusConfig.bgColor} rounded-lg`}
          >
            <StatusIcon className={`w-4 h-4 ${statusConfig.textColor}`} />
            <span className={`text-sm font-medium ${statusConfig.textColor}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* ALM Tool Badge */}
      {session.alm_tool && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300 border border-slate-600/30">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z" />
            </svg>
            {session.alm_tool}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-400">
          Created{" "}
          {new Date(session.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">
            0 tests
            {/* need to add proper logic to find testcases generated count */}
          </span>
        </div>
      </div>

      <button
        onClick={() => router.push(`/sessions/${session.id}`)}
        className="w-full px-4 py-3 bg-gradient-to-r hover:cursor-pointer from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:-translate-y-0.5 group-hover:scale-105"
      >
        Open Session
      </button>
    </div>
  );
}
