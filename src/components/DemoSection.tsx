import React, { useState } from 'react';

const DemoSection: React.FC = () => {
  const [taskDescription, setTaskDescription] = useState('');
  const [taskType, setTaskType] = useState('ui');
  const [complexity, setComplexity] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setResult({
        success: true,
        taskId: 'demo-123',
        analysis: {
          type: taskType,
          complexity,
          tokenBudget: {
            total: 2000,
            analysis: 400,
            implementation: 1200,
            review: 400
          }
        }
      });
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to analyze task'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">API Demo</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Task Description
          </label>
          <textarea
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            placeholder="Describe your task..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Task Type
            </label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="ui">UI Component</option>
              <option value="logic">Logic/Function</option>
              <option value="design">Design System</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Complexity
            </label>
            <select
              value={complexity}
              onChange={(e) => setComplexity(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !taskDescription}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading || !taskDescription
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {loading ? 'Analyzing...' : 'Analyze Task'}
        </button>
      </form>

      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Result</h3>
          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
};

export default DemoSection;