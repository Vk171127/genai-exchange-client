import React from "react";
import Link from "next/link";
import type { Session } from "@/lib/types";

interface SessionCardProps {
  session: Session;
}

export default function SessionCard({ session }: SessionCardProps) {
  const getStatusColor = (status: Session["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {session.project_name}
        </h3>
        <span
          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
            session.status
          )}`}
        >
          {session.status}
        </span>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        Created: {formatDate(session.created_at)}
      </div>

      <div className="flex justify-end">
        <Link
          href={`/sessions/${session.id}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          Open Session
        </Link>
      </div>
    </div>
  );
}
