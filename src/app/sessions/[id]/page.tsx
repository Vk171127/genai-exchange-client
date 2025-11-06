"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import WorkflowChatInterface from "@/components/WorkflowChatInterface";
import { getSessionDetails } from "@/lib/api";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id as string;

  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   if (!sessionId) {
  //     setError("Invalid session ID");
  //     setLoading(false);
  //     return;
  //   }

  //   // Verify session exists
  //   const verifySession = async () => {
  //     try {
  //       await getSessionDetails(sessionId);
  //       setLoading(false);
  //     } catch (err: any) {
  //       console.error("Session verification failed:", err);
  //       if (err.status === 404) {
  //         setError("Session not found");
  //       } else {
  //         setError("Failed to load session");
  //       }
  //       setLoading(false);
  //     }
  //   };

  //   verifySession();
  // }, [sessionId]);

  // // Loading state
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
  //       <div className="text-center">
  //         <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
  //         <p className="text-slate-300 text-lg">Loading session...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // // Error state
  // if (error) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
  //       <div className="text-center max-w-md mx-auto px-6">
  //         <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
  //           <AlertCircle className="w-10 h-10 text-red-400" />
  //         </div>
  //         <h2 className="text-3xl font-bold text-white mb-3">
  //           {error === "Session not found"
  //             ? "Session Not Found"
  //             : "Error Loading Session"}
  //         </h2>
  //         <p className="text-slate-400 mb-8">
  //           {error === "Session not found"
  //             ? "The session you're looking for doesn't exist or has been deleted."
  //             : "Something went wrong while loading the session. Please try again."}
  //         </p>
  //         <div className="flex gap-4 justify-center">
  //           <button
  //             onClick={() => router.back()}
  //             className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all flex items-center gap-2"
  //           >
  //             <ArrowLeft className="w-4 h-4" />
  //             Go Back
  //           </button>
  //           <button
  //             onClick={() => router.push("/dashboard")}
  //             className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
  //           >
  //             Go to Dashboard
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return <WorkflowChatInterface sessionId={sessionId} />;
}
