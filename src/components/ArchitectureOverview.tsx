import React from 'react';

const ArchitectureOverview: React.FC = () => {
  const layers = [
    {
      name: 'Layer 1: AIACD Core',
      description: 'Orchestration Layer',
      components: ['Task Analyzer', 'Template Manager', 'Token Tracker', 'Quality Analyzer', 'Metrics Dashboard'],
      current: true
    },
    {
      name: 'Layer 2: bolt.diy-impl',
      description: 'Integration Layer',
      components: ['API Endpoints', 'Authentication', 'WSL Client', 'Template Management', 'Token Metrics']
    },
    {
      name: 'Layer 3: bolt.diy-standalone',
      description: 'Implementation Environment',
      components: ['IDE Environment', 'Web Container', 'Code Execution', 'Error Detection', 'Deployment']
    },
    {
      name: 'Layer 4: MetaGipsy',
      description: 'Interaction Analysis Layer',
      components: ['Conversation Analyzer', 'Pattern Recognition', 'User Profiling', 'Prediction Engine']
    }
  ];

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Architecture Overview</h2>
      <div className="space-y-6">
        {layers.map((layer, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg ${
              layer.current ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50'
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              {layer.name}
              {layer.current && (
                <span className="ml-2 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded">
                  Current
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{layer.description}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {layer.components.map((component, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded"
                >
                  {component}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ArchitectureOverview;