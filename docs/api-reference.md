# API Reference

This document provides comprehensive documentation for the AIACD Core Client API.

## Table of Contents

- [Client Initialization](#client-initialization)
- [Task Management](#task-management)
  - [Submit Task](#submit-task)
  - [Get Task Status](#get-task-status)
  - [Get Task Implementation](#get-task-implementation)
- [Streaming Support](#streaming-support)
  - [Connect to Task Stream](#connect-to-task-stream)
  - [Event Handling](#event-handling)
- [Template Management](#template-management)
  - [Get Templates](#get-templates)
  - [Get Template](#get-template)
  - [Create Template](#create-template)
  - [Select Best Template](#select-best-template)
- [Token Metrics](#token-metrics)
  - [Get Efficiency Metrics](#get-efficiency-metrics)
  - [Get Timeseries Metrics](#get-timeseries-metrics)
  - [Get Efficiency Trend](#get-efficiency-trend)
- [Error Handling](#error-handling)
- [Types](#types)

## Client Initialization

The AiacdCoreClient is the main entry point for interacting with the Integration Layer (Layer 2) API.

```typescript
import { AiacdCoreClient } from 'aiacd-source';

const client = new AiacdCoreClient({
  baseUrl: 'https://your-api-url.com',
  apiKey: 'your-api-key',
  timeout: 30000, // optional, default: 30000 (30 seconds)
  retries: 3,     // optional, default: 3
  environment: 'production', // 'development', 'staging', or 'production'
  logLevel: 'info' // optional, default: 'info'
});
```

### Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `baseUrl` | string | Yes | - | The base URL of the Integration Layer API |
| `apiKey` | string | Yes | - | API key for authentication |
| `timeout` | number | No | 30000 | Request timeout in milliseconds |
| `retries` | number | No | 3 | Number of retry attempts for failed requests |
| `environment` | string | No | 'development' | Environment ('development', 'staging', 'production') |
| `logLevel` | string | No | 'info' | Log level ('debug', 'info', 'warn', 'error') |

## Task Management

### Submit Task

Submits a new task to the Integration Layer.

```typescript
async submitTask(task: Task): Promise<{ taskId: string; status: string }>
```

#### Parameters

- `task` (Task): The task to submit
  - `prompt` (string): Task description or prompt
  - `type` (string): Task type (e.g., 'ui', 'function', 'utility')
  - `complexity` (string): Task complexity ('low', 'medium', 'high')
  - `context` (Record<string, unknown>, optional): Additional context for the task

#### Returns

- `taskId` (string): Unique identifier for the task
- `status` (string): Initial status of the task

#### Example

```typescript
const result = await client.submitTask({
  prompt: 'Create a React button component with hover effects',
  type: 'ui',
  complexity: 'low',
  context: {
    framework: 'react',
    styling: 'tailwind'
  }
});

console.log(`Task ID: ${result.taskId}`);
console.log(`Status: ${result.status}`);
```

### Get Task Status

Checks the status of a task.

```typescript
async getTaskStatus(taskId: string): Promise<{ status: string; progress?: number }>
```

#### Parameters

- `taskId` (string): The ID of the task to check

#### Returns

- `status` (string): Current status of the task ('pending', 'processing', 'completed', 'failed')
- `progress` (number, optional): Progress percentage (0-100) if available

#### Example

```typescript
const status = await client.getTaskStatus('task-123');
console.log(`Status: ${status.status}`);
if (status.progress) {
  console.log(`Progress: ${status.progress}%`);
}
```

### Get Task Implementation

Retrieves the implementation result for a completed task.

```typescript
async getTaskImplementation(taskId: string): Promise<{
  implementation: string;
  files?: Array<{ name: string; content: string }>;
}>
```

#### Parameters

- `taskId` (string): The ID of the task

#### Returns

- `implementation` (string): The implementation code or content
- `files` (Array, optional): Array of files if the implementation includes multiple files
  - `name` (string): File name
  - `content` (string): File content

#### Example

```typescript
const result = await client.getTaskImplementation('task-123');
console.log('Implementation:');
console.log(result.implementation);

if (result.files) {
  console.log('Files:');
  result.files.forEach(file => {
    console.log(`${file.name}:`);
    console.log(file.content);
  });
}
```

## Streaming Support

### Connect to Task Stream

Connects to the event stream for a task to receive real-time updates.

```typescript
connectToTaskStream(taskId: string): void
```

#### Parameters

- `taskId` (string): The ID of the task to stream

#### Example

```typescript
client.connectToTaskStream('task-123');
```

### Event Handling

Register event handlers for different event types.

```typescript
on(event: string, handler: Function): void
```

#### Parameters

- `event` (string): Event type to listen for
- `handler` (Function): Callback function to handle the event

#### Available Events

- `connected`: Fired when the connection is established
- `task.status`: Fired when the task status changes
- `task.progress`: Fired when progress is updated
- `task.output`: Fired when new output is available
- `task.completion`: Fired when the task is completed
- `task.error`: Fired when an error occurs during task processing
- `error`: Fired when a stream connection error occurs

#### Example

```typescript
// Register event handlers
client.on('connected', (data) => {
  console.log('Connected to stream for task:', data.taskId);
});

client.on('task.status', (data) => {
  console.log(`Status updated: ${data.status}`);
});

client.on('task.progress', (data) => {
  console.log(`Progress: ${data.progress}%`);
});

client.on('task.output', (data) => {
  console.log('Output:', data.content);
});

client.on('task.completion', (data) => {
  console.log('Task completed!');
  console.log('Implementation:', data.implementation);
});

client.on('task.error', (data) => {
  console.error('Task error:', data.message);
});

client.on('error', (data) => {
  console.error('Stream error:', data.type);
});
```

## Template Management

### Get Templates

Retrieves templates, optionally filtered by type.

```typescript
async getTemplates(type?: string): Promise<Template[]>
```

#### Parameters

- `type` (string, optional): Filter templates by type

#### Returns

- Array of Template objects

#### Example

```typescript
// Get all templates
const allTemplates = await client.getTemplates();

// Get templates for UI components
const uiTemplates = await client.getTemplates('ui');
```

### Get Template

Retrieves a specific template by ID.

```typescript
async getTemplate(id: string): Promise<Template>
```

#### Parameters

- `id` (string): Template ID

#### Returns

- Template object

#### Example

```typescript
const template = await client.getTemplate('template-123');
console.log(`Template name: ${template.name}`);
console.log(`Template content: ${template.content}`);
```

### Create Template

Creates a new template.

```typescript
async createTemplate(template: Template): Promise<string>
```

#### Parameters

- `template` (Template): Template object
  - `name` (string): Template name
  - `type` (string): Template type
  - `content` (string): Template content
  - `metadata` (Record<string, unknown>, optional): Additional metadata

#### Returns

- `id` (string): ID of the created template

#### Example

```typescript
const templateId = await client.createTemplate({
  name: 'React Button',
  type: 'ui',
  content: '# Button Component\n\n{description}\n\n## Props\n{props}',
  metadata: {
    version: '1.0',
    complexity: 'low'
  }
});

console.log(`Created template with ID: ${templateId}`);
```

### Select Best Template

Selects the best template for a given task type and complexity.

```typescript
async selectBestTemplate(task: { type: string; complexity: string }): Promise<Template | null>
```

#### Parameters

- `task` (object): Task details
  - `type` (string): Task type
  - `complexity` (string): Task complexity

#### Returns

- Template object or null if no suitable template found

#### Example

```typescript
const bestTemplate = await client.selectBestTemplate({
  type: 'ui',
  complexity: 'medium'
});

if (bestTemplate) {
  console.log(`Selected template: ${bestTemplate.name}`);
} else {
  console.log('No suitable template found');
}
```

## Token Metrics

### Get Efficiency Metrics

Retrieves token efficiency metrics, optionally filtered by template type and date range.

```typescript
async getEfficiencyMetrics(options?: {
  templateType?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<any[]>
```

#### Parameters

- `options` (object, optional): Filter options
  - `templateType` (string, optional): Filter by template type
  - `startDate` (Date, optional): Start date for metrics
  - `endDate` (Date, optional): End date for metrics

#### Returns

- Array of efficiency metric objects

#### Example

```typescript
// Get all efficiency metrics
const allMetrics = await client.getEfficiencyMetrics();

// Get efficiency metrics for UI templates in the last month
const uiMetrics = await client.getEfficiencyMetrics({
  templateType: 'ui',
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  endDate: new Date()
});
```

### Get Timeseries Metrics

Retrieves time-series metrics for token usage.

```typescript
async getTimeseriesMetrics(
  startDate: Date,
  endDate: Date,
  taskType?: string
): Promise<any[]>
```

#### Parameters

- `startDate` (Date): Start date for metrics
- `endDate` (Date): End date for metrics
- `taskType` (string, optional): Filter by task type

#### Returns

- Array of time-series metric objects

#### Example

```typescript
// Get time-series metrics for the last week
const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const now = new Date();

const metrics = await client.getTimeseriesMetrics(oneWeekAgo, now);
```

### Get Efficiency Trend

Retrieves token efficiency trend data.

```typescript
async getEfficiencyTrend(
  days: number = 30,
  taskType?: string
): Promise<{ date: string; efficiency: number }[]>
```

#### Parameters

- `days` (number, optional): Number of days to include (default: 30)
- `taskType` (string, optional): Filter by task type

#### Returns

- Array of efficiency trend data points
  - `date` (string): Date in ISO format
  - `efficiency` (number): Efficiency ratio

#### Example

```typescript
// Get efficiency trend for the last 60 days
const trend = await client.getEfficiencyTrend(60);

// Get efficiency trend for UI tasks
const uiTrend = await client.getEfficiencyTrend(30, 'ui');
```

## Error Handling

The client uses a retry mechanism with exponential backoff for failed requests. Errors are thrown if all retry attempts fail.

```typescript
try {
  const result = await client.submitTask({
    prompt: 'Create a React button component',
    type: 'ui',
    complexity: 'low'
  });
} catch (error) {
  console.error('Failed to submit task:', error.message);
}
```

All methods will throw an error if:

- API request fails after all retry attempts
- Authentication fails
- Input validation fails
- The server returns an error response

## Types

### Task

```typescript
interface Task {
  prompt: string;
  type: string;
  complexity: string;
  context?: Record<string, unknown>;
}
```

### Template

```typescript
interface Template {
  name: string;
  type: string;
  content: string;
  metadata?: Record<string, unknown>;
}
```

### Configuration

```typescript
interface Config {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
  retries?: number;
  environment: 'development' | 'staging' | 'production';
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
```
