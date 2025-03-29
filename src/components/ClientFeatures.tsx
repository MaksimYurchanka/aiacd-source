import React from 'react';

const ClientFeatures: React.FC = () => {
  const features = [
    {
      title: 'Task Analysis',
      description: 'Analyze task requirements and determine optimal implementation strategies',
      icon: '📊'
    },
    {
      title: 'Template Management',
      description: 'Select and manage templates for different task types',
      icon: '📝'
    },
    {
      title: 'Token Tracking',
      description: 'Track token usage and calculate efficiency metrics',
      icon: '📈'
    },
    {
      title: 'Quality Assessment',
      description: 'Evaluate implementation quality across multiple dimensions',
      icon: '✨'
    },
    {
      title: 'Layer 2 Integration',
      description: 'Communicate with the Integration Layer via API client',
      icon: '🔄'
    },
    {
      title: 'Metrics Visualization',
      description: 'Visualize performance metrics and efficiency gains',
      icon: '📊'
    }
  ];

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Client Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl mb-2">{feature.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ClientFeatures;