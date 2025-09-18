"use client";
import React, { useState } from "react";
import { X } from "lucide-react";

interface TestCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestCasesGenerated: (testCases: any[]) => void;
  analysis: string;
}

export default function TestCaseModal({
  isOpen,
  onClose,
  onTestCasesGenerated,
  analysis,
}: TestCaseModalProps) {
  const [generating, setGenerating] = useState(false);
  const [generatedTestCases, setGeneratedTestCases] = useState<any[]>([]);

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      // TODO: need to attach api here - call test case generation API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockTestCases = [
        {
          id: "TC001",
          title: "Patient Login - Valid Credentials",
          description: "Verify patient can login with valid credentials",
          priority: "High",
          type: "Functional",
        },
        {
          id: "TC002",
          title: "HIPAA Data Encryption Validation",
          description:
            "Verify all patient data is encrypted at rest and in transit",
          priority: "Critical",
          type: "Security",
        },
        {
          id: "TC003",
          title: "Medical Device Integration Error Handling",
          description:
            "Verify system handles medical device connection failures gracefully",
          priority: "Medium",
          type: "Integration",
        },
      ];

      setGeneratedTestCases(mockTestCases);
    } catch (error) {
      console.error("Test case generation error:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleAccept = () => {
    onTestCasesGenerated(generatedTestCases);
    onClose();
    setGeneratedTestCases([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Generate Test Cases
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {generatedTestCases.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Ready to generate test cases based on your analysis
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {generating ? "Generating Test Cases..." : "Generate Test Cases"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">
              Generated Test Cases ({generatedTestCases.length})
            </h4>

            <div className="space-y-3">
              {generatedTestCases.map((testCase, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-md p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">
                        {testCase.id}: {testCase.title}
                      </h5>
                      <p className="text-gray-600 mt-1">
                        {testCase.description}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          testCase.priority === "Critical"
                            ? "bg-red-100 text-red-800"
                            : testCase.priority === "High"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {testCase.priority}
                      </span>
                      <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                        {testCase.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Accept & Save Test Cases
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
