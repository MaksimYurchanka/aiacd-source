# AI-AutoCoding-DAO (AIACD)

## Orchestration Layer for AI-Assisted Development
Achieve 5-7x improvement in token efficiency through intelligent orchestration.

[Report Bug](https://github.com/MaksimYurchanka/aiacd-source/issues) · [Request Feature](https://github.com/MaksimYurchanka/aiacd-source/issues)

## Overview

AI-AutoCoding-DAO (AIACD) is a sophisticated framework for optimizing AI-assisted development through intelligent orchestration. This repository contains the **Orchestration Layer (Layer 1)** of the AIACD four-layer architecture, responsible for analyzing tasks, selecting optimal implementation approaches, and tracking token efficiency metrics.

### Value Proposition

- **Token Efficiency**: Achieve 5-7x improvement in token utilization compared to direct AI usage
- **Quality Assurance**: Maintain 8.5+/10 implementation quality across various tasks
- **Implementation Optimization**: Intelligent template selection based on task characteristics
- **Comprehensive Metrics**: Track and visualize token usage and efficiency metrics
- **Strategic Orchestration**: Data-driven decision making for implementation approaches

## Architecture

AIACD follows a comprehensive four-layer architecture designed to maximize token efficiency:

```
AI-AutoCoding-DAO Ecosystem
├── Layer 1: AIACD Core (Orchestration Layer) ← THIS REPOSITORY
│   ├── Task Analyzer
│   ├── Template Manager
│   ├── Token Tracker
│   ├── Quality Analyzer
│   ├── Metrics Dashboard
│   └── Integration Layer API Client
├── Layer 2: bolt.diy-impl (Integration Layer)
│   ├── API Endpoints
│   ├── Authentication System
│   ├── bolt.diy WSL Client
│   ├── Template Management
│   ├── Streaming Support
│   └── Token Metrics Service
├── Layer 3: bolt.diy-standalone (Implementation Environment)
│   ├── Full IDE Environment
│   ├── Web Container
│   ├── Code Execution Engine
│   ├── Error Detection
│   └── Deployment Pipeline
└── Layer 4: MetaGipsy (Interaction Analysis Layer)
    ├── Conversation Analyzer
    ├── Pattern Recognition
    ├── User Profiling
    └── Prediction Engine
```

## Key Features

- **Task Analysis**: Sophisticated algorithm for determining task complexity and requirements
- **Template Management**: Intelligent selection and application of templates for different task types
- **Token Tracking**: Comprehensive metrics for measuring token consumption and efficiency
- **Quality Assessment**: Multi-dimensional evaluation of implementation quality
- **Layer 2 Integration**: Robust API client for communicating with the Integration Layer
- **Streaming Support**: Real-time updates during task implementation
- **Metrics Dashboard**: Visualization of token efficiency and performance metrics

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- TypeScript 5+

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MaksimYurchanka/aiacd-source.git
   cd aiacd-source
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your API credentials:
   ```
   AIACD_API_URL=your_layer2_api_url
   AIACD_API_KEY=your_api_key
   ```

4. Build the project:
   ```bash
   npm run build
   # or
   pnpm run build
   ```

### Usage

#### Basic Example

```typescript
import { AiacdCoreClient } from 'aiacd-source';

// Initialize the client
const client = new AiacdCoreClient({
  baseUrl: process.env.AIACD_API_URL,
  apiKey: process.env.AIACD_API_KEY,
  environment: 'production'
});

// Submit a task
async function processTask() {
  const result = await client.submitTask({
    prompt: 'Create a React button component with hover effects',
    type: 'ui',
    complexity: 'low'
  });
  
  console.log(`Task submitted with ID: ${result.taskId}`);
  console.log(`Status: ${result.status}`);
  
  // Connect to the task stream for real-time updates
  client.connectToTaskStream(result.taskId);
  
  // Register event handlers
  client.on('task.status', (data) => {
    console.log(`Status updated: ${data.status}`);
  });
  
  client.on('task.completion', (data) => {
    console.log(`Task completed!`);
    console.log(`Implementation: ${data.implementation}`);
  });
}

processTask().catch(console.error);
```

#### Template Management

```typescript
// Get templates for UI components
const uiTemplates = await client.getTemplates('ui');

// Create a new template
const templateId = await client.createTemplate({
  name: 'React Button',
  type: 'ui',
  content: '# Button Component\n\n{description}\n\n## Props\n{props}',
  metadata: {
    version: '1.0',
    complexity: 'low'
  }
});

// Select the best template for a task
const bestTemplate = await client.selectBestTemplate({
  type: 'ui',
  complexity: 'medium'
});
```

#### Token Metrics

```typescript
// Get efficiency metrics
const metrics = await client.getEfficiencyMetrics({
  templateType: 'ui',
  startDate: new Date('2025-01-01'),
  endDate: new Date()
});

// Get efficiency trend
const trend = await client.getEfficiencyTrend(30, 'ui');
```

## API Reference

See the [API Documentation](docs/api-reference.md) for detailed information on all available methods.

## Token Efficiency Methodology

AIACD achieves 5-7x token efficiency improvement through:

1. **Intelligent Template Selection**: Optimized templates for different task types
2. **Strategic Task Decomposition**: Breaking complex tasks into manageable components
3. **Implementation Environment Optimization**: Direct execution in Web Container
4. **Continuous Improvement**: Learning from successful implementations

For details on how token efficiency is measured and optimized, see [Token Efficiency](docs/token-efficiency.md).

## Contributing

Contributions are welcome! Please check out our [Contributing Guide](CONTRIBUTING.md) for guidelines on how to proceed.

### Development

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Install development dependencies: `npm install`
4. Make your changes
5. Run tests: `npm test`
6. Commit your changes: `git commit -m 'Add some amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Claude Sonnet](https://www.anthropic.com/) - AI model used for orchestration
- [bolt.diy](https://github.com/MaksimYurchanka/boltdiy-impl) - Implementation environment
- The AIACD community for continued support and contributions
