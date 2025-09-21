import React from 'react';
import { TestCase } from './WorkflowChatInterface';


// interface TestCase {
//   id: string;
//   session_id: string;
//   test_name: string;
//   test_description: string;
//   test_steps: string[];
//   expected_results: string;
//   test_type: string;
//   priority: string;
//   status: string;
//   created_at: string;
//   updated_at: string;
//   linked_requirements: string[];
// }

interface TestCaseListProps {
  testCases: TestCase[];
}

const TestCaseList: React.FC<TestCaseListProps> = ({ testCases }) => {
  return (
    <div className="space-y-4 overflow-auto max-h-112">
      {testCases.map((testCase) => (
        <div key={testCase.id} className="bg-slate-800/50 rounded-lg p-4">
          <h4 className="text-white font-semibold">{testCase.test_name}</h4>
          <p className="text-slate-400">{testCase.test_description}</p>
          <ul className="list-disc list-inside text-slate-300">
            {testCase.test_steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
          <p className="text-green-300">
            Expected Result: {testCase.expected_results}
          </p>
          <p className="text-yellow-300">Priority: {testCase.priority}</p>
          <p className="text-blue-300">Status: {testCase.status}</p>
        </div>
      ))}
    </div>
  );
};

export default TestCaseList;
