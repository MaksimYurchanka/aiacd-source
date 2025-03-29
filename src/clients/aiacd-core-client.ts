import EventSource from 'eventsource';
import retry from 'retry';
import fetch from 'node-fetch';
import { z } from 'zod';
import logger from '../utils/logger';

// Schema definitions
const TaskSchema = z.object({
  prompt: z.string(),
  type: z.string(),
  complexity: z.string(),
  context: z.record(z.unknown()).optional()
});

const TemplateSchema = z.object({
  name: z.string(),
  type: z.string(),
  content: z.string(),
  metadata: z.record(z.unknown()).optional()
});

const ConfigSchema = z.object({
  baseUrl: z.string(),
  apiKey: z.string(),
  timeout: z.number().optional().default(30000),
  retries: z.number().optional().default(3),
  environment: z.enum(['development', 'staging', 'production']),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).optional().default('info')
});

type Config = z.infer<typeof ConfigSchema>;
type Task = z.infer<typeof TaskSchema>;
type Template = z.infer<typeof TemplateSchema>;

export class AiacdCoreClient {
  private readonly config: Config;
  private readonly eventHandlers: Map<string, Function[]>;

  constructor(config: Partial<Config>) {
    this.config = this.createConfig(config);
    this.eventHandlers = new Map();
    logger.configure({ logLevel: this.config.logLevel });
  }

  /**
   * Create configuration with defaults
   */
  private createConfig(override?: Partial<Config>): Config {
    const defaults: Config = {
      baseUrl: process.env.AIACD_API_URL || 'http://localhost:5173',
      apiKey: process.env.AIACD_API_KEY || '',
      timeout: 30000,
      retries: 3,
      environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
      logLevel: 'info'
    };

    return ConfigSchema.parse({ ...defaults, ...override });
  }

  /**
   * Make authenticated API request with retry logic
   */
  private async makeRequest(
    endpoint: string,
    options: { method?: string; body?: any } = {}
  ) {
    const operation = retry.operation({
      retries: this.config.retries,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 10000
    });

    return new Promise((resolve, reject) => {
      operation.attempt(async (currentAttempt) => {
        try {
          const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
            method: options.method || 'GET',
            headers: {
              'Authorization': `Bearer ${this.config.apiKey}`,
              'Content-Type': 'application/json'
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
            timeout: this.config.timeout
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API request failed');
          }

          const data = await response.json();
          resolve(data);
        } catch (error) {
          if (operation.retry(error as Error)) {
            logger.warn(`Request failed, retrying (${currentAttempt}/${this.config.retries})`);
            return;
          }
          reject(operation.mainError());
        }
      });
    });
  }

  /**
   * Submit a new task
   */
  async submitTask(task: Task): Promise<{ taskId: string; status: string }> {
    try {
      TaskSchema.parse(task);
      return await this.makeRequest('/api/v1/tasks', {
        method: 'POST',
        body: task
      });
    } catch (error) {
      logger.error('Task submission failed:', error);
      throw error;
    }
  }

  /**
   * Get task status
   */
  async getTaskStatus(taskId: string): Promise<{ status: string; progress?: number }> {
    try {
      return await this.makeRequest(`/api/v1/tasks/${taskId}/status`);
    } catch (error) {
      logger.error('Task status check failed:', error);
      throw error;
    }
  }

  /**
   * Get task implementation
   */
  async getTaskImplementation(taskId: string): Promise<{
    implementation: string;
    files?: Array<{ name: string; content: string }>;
  }> {
    try {
      return await this.makeRequest(`/api/v1/tasks/${taskId}/implementation`);
    } catch (error) {
      logger.error('Implementation retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Connect to task event stream
   */
  connectToTaskStream(taskId: string): void {
    try {
      const eventSource = new EventSource(
        `${this.config.baseUrl}/api/v1/tasks/${taskId}/stream`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );

      const events = [
        'connected',
        'task.status',
        'task.progress',
        'task.output',
        'task.completion',
        'task.error',
        'error'
      ];

      events.forEach(event => {
        eventSource.addEventListener(event, this.handleEvent.bind(this, event));
      });

      eventSource.onerror = () => {
        logger.error('Stream connection error');
        this.emit('error', { type: 'connectionError' });
        eventSource.close();
        
        // Attempt reconnection after delay
        setTimeout(() => {
          this.connectToTaskStream(taskId);
        }, 5000);
      };
    } catch (error) {
      logger.error('Stream connection failed:', error);
      throw error;
    }
  }

  /**
   * Handle stream events
   */
  private handleEvent(type: string, event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      this.emit(type, data);
    } catch (error) {
      logger.error('Event handling failed:', error);
      this.emit('error', { type: 'eventError', error });
    }
  }

  /**
   * Emit event to registered handlers
   */
  private emit(type: string, data: any): void {
    const handlers = this.eventHandlers.get(type) || [];
    handlers.forEach(handler => handler(data));
  }

  /**
   * Register event handler
   */
  on(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.push(handler);
    this.eventHandlers.set(event, handlers);
  }

  /**
   * Template management methods
   */
  async getTemplates(type?: string): Promise<Template[]> {
    try {
      const endpoint = type ? 
        `/api/v1/templates?type=${type}` : 
        '/api/v1/templates';
      return await this.makeRequest(endpoint);
    } catch (error) {
      logger.error('Template retrieval failed:', error);
      throw error;
    }
  }

  async getTemplate(id: string): Promise<Template> {
    try {
      return await this.makeRequest(`/api/v1/templates/${id}`);
    } catch (error) {
      logger.error('Template retrieval failed:', error);
      throw error;
    }
  }

  async createTemplate(template: Template): Promise<string> {
    try {
      TemplateSchema.parse(template);
      const response = await this.makeRequest('/api/v1/templates', {
        method: 'POST',
        body: template
      });
      return response.id;
    } catch (error) {
      logger.error('Template creation failed:', error);
      throw error;
    }
  }

  async selectBestTemplate(task: { type: string; complexity: string }): Promise<Template | null> {
    try {
      return await this.makeRequest('/api/v1/templates/select', {
        method: 'POST',
        body: task
      });
    } catch (error) {
      logger.error('Template selection failed:', error);
      throw error;
    }
  }

  /**
   * Token metrics methods
   */
  async getEfficiencyMetrics(options?: {
    templateType?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();
      if (options?.templateType) queryParams.set('type', options.templateType);
      if (options?.startDate) queryParams.set('start', options.startDate.toISOString());
      if (options?.endDate) queryParams.set('end', options.endDate.toISOString());

      return await this.makeRequest(`/api/v1/metrics/efficiency?${queryParams}`);
    } catch (error) {
      logger.error('Efficiency metrics retrieval failed:', error);
      throw error;
    }
  }

  async getTimeseriesMetrics(
    startDate: Date,
    endDate: Date,
    taskType?: string
  ): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams({
        start: startDate.toISOString(),
        end: endDate.toISOString()
      });
      if (taskType) queryParams.set('type', taskType);

      return await this.makeRequest(`/api/v1/metrics/timeseries?${queryParams}`);
    } catch (error) {
      logger.error('Timeseries metrics retrieval failed:', error);
      throw error;
    }
  }

  async getEfficiencyTrend(
    days: number = 30,
    taskType?: string
  ): Promise<{ date: string; efficiency: number }[]> {
    try {
      const queryParams = new URLSearchParams({ days: days.toString() });
      if (taskType) queryParams.set('type', taskType);

      return await this.makeRequest(`/api/v1/metrics/trend?${queryParams}`);
    } catch (error) {
      logger.error('Efficiency trend retrieval failed:', error);
      throw error;
    }
  }
}