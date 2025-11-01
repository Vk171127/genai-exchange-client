import { Session } from "@/lib/types";
import { Activity, BarChart3, CheckCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export function SessionCard({ session }: { session: Session }) {
  const router = useRouter();

  const getStatusConfig = (status: Session["status"]) => {
    switch (status) {
      case "active":
        return {
          color: "from-green-500 to-emerald-500",
          textColor: "text-green-300",
          bgColor: "bg-green-500/10",
          icon: Activity,
        };
      case "completed":
        return {
          color: "from-blue-500 to-cyan-500",
          textColor: "text-blue-300",
          bgColor: "bg-blue-500/10",
          icon: CheckCircle,
        };
      case "draft":
        return {
          color: "from-orange-500 to-red-500",
          textColor: "text-orange-300",
          bgColor: "bg-orange-500/10",
          icon: Clock,
        };
      default:
        return {
          color: "from-gray-500 to-gray-600",
          textColor: "text-gray-300",
          bgColor: "bg-gray-500/10",
          icon: Activity,
        };
    }
  };

  const statusConfig = getStatusConfig(session.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
            {session.project_name}
          </h3>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 ${statusConfig.bgColor} rounded-lg`}
          >
            <StatusIcon className={`w-4 h-4 ${statusConfig.textColor}`} />
            <span
              className={`text-sm font-medium ${statusConfig.textColor} capitalize`}
            >
              {session.status}
            </span>
          </div>
        </div>
      </div>

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
          <span className="text-sm text-gray-400">0 tests</span>
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
