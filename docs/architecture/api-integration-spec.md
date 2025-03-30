# AIACD-bolt.diy API Integration Specification

## Overview

This document specifies the API integration between the AIACD Core (Orchestration Layer) and bolt.diy (Implementation Layer). It defines the communication protocols, authentication mechanisms, endpoint specifications, and data formats for seamless interaction between the two systems.

## System Architecture Context

```
┌───────────────────────┐                  ┌───────────────────────┐
│                       │                  │                       │
│     AIACD Core        │                  │       bolt.diy        │
│  (Orchestration)      │◄─── APIs ───────►│  (Implementation)     │
│                       │                  │                       │
└───────────────────────┘                  └───────────────────────┘
       │                                          │
       │                                          │
       ▼                                          ▼
┌───────────────────────┐                  ┌───────────────────────┐
│                       │                  │                       │
│      Supabase         │                  │     Claude API        │
│                       │                  │                       │
└───────────────────────┘                  └───────────────────────┘
```

## Authentication

### API Key Authentication
- Each system authenticates using a pre-shared API key
- API keys are passed in the `Authorization` header
- Format: `Authorization: Bearer {api_key}`

### Security Requirements
- TLS encryption for all API communication
- API keys stored securely as environment variables
- Rate limiting to prevent abuse
- IP restrictions where appropriate

## API Endpoints

### 1. AIACD Core → bolt.diy Endpoints

#### 1.1 Task Submission
- **Endpoint**: `POST /api/tasks`
- **Purpose**: Submit a new task for implementation
- **Request Body**:
  ```json
  {
    "taskId": "string",
    "description": "string",
    "type": "ui|function|utility",
    "complexity": "low|medium|high",
    "template": "string",
    "features": ["string"],
    "context": {
      "additionalProp1": "string"
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "taskId": "string",
    "status": "received|processing|completed|failed",
    "estimatedCompletion": "ISO-8601 timestamp"
  }
  ```

#### 1.2 Task Status Check
- **Endpoint**: `GET /api/tasks/{taskId}/status`
- **Purpose**: Check the status of a task
- **Response**:
  ```json
  {
    "taskId": "string",
    "status": "received|processing|completed|failed",
    "progress": 0-100,
    "message": "string",
    "estimatedCompletion": "ISO-8601 timestamp"
  }
  ```

#### 1.3 Implementation Retrieval
- **Endpoint**: `GET /api/tasks/{taskId}/implementation`
- **Purpose**: Get the implementation results for a completed task
- **Response**:
  ```json
  {
    "taskId": "string",
    "status": "completed|failed",
    "implementation": "string",
    "files": [
      {
        "name": "string",
        "path": "string",
        "content": "string",
        "language": "string"
      }
    ],
    "tokenUsage": {
      "prompt": 0,
      "completion": 0,
      "total": 0
    },
    "errors": [
      {
        "type": "string",
        "message": "string",
        "location": "string"
      }
    ]
  }
  ```

#### 1.4 Task Modification
- **Endpoint**: `PUT /api/tasks/{taskId}`
- **Purpose**: Modify an existing task or request changes to implementation
- **Request Body**:
  ```json
  {
    "description": "string",
    "modifications": "string",
    "feedback": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "taskId": "string",
    "status": "processing",
    "message": "string"
  }
  ```

#### 1.5 Task Cancellation
- **Endpoint**: `DELETE /api/tasks/{taskId}`
- **Purpose**: Cancel a task that is in progress
- **Response**:
  ```json
  {
    "success": true,
    "taskId": "string",
    "message": "string"
  }
  ```

### 2. bolt.diy → AIACD Core Endpoints

#### 2.1 Token Usage Reporting
- **Endpoint**: `POST /api/metrics/tokens`
- **Purpose**: Report token usage for a task
- **Request Body**:
  ```json
  {
    "taskId": "string",
    "tokenUsage": {
      "prompt": 0,
      "completion": 0,
      "total": 0
    },
    "timestamp": "ISO-8601 timestamp"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "received": true
  }
  ```

#### 2.2 Error Reporting
- **Endpoint**: `POST /api/tasks/{taskId}/errors`
- **Purpose**: Report errors encountered during implementation
- **Request Body**:
  ```json
  {
    "errorType": "string",
    "message": "string",
    "stackTrace": "string",
    "location": "string",
    "timestamp": "ISO-8601 timestamp"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "received": true,
    "action": "retry|abort|continue"
  }
  ```

#### 2.3 Status Updates
- **Endpoint**: `POST /api/tasks/{taskId}/status`
- **Purpose**: Update the status of a task
- **Request Body**:
  ```json
  {
    "status": "processing|completed|failed",
    "progress": 0-100,
    "message": "string",
    "timestamp": "ISO-8601 timestamp"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "received": true
  }
  ```

## Error Handling

### HTTP Status Codes
- **200 OK**: Request successful
- **201 Created**: Resource successfully created
- **400 Bad Request**: Malformed request or invalid parameters
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Authentication valid but insufficient permissions
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side error
- **503 Service Unavailable**: Service temporarily unavailable

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

## Retry Strategy

### Exponential Backoff
- Initial retry after 1 second
- Double delay for each subsequent retry
- Maximum of 5 retries
- Maximum delay of 60 seconds

### Idempotency
- All POST requests should include an idempotency key
- Format: `Idempotency-Key: {uuid}`
- Server should return cached response for duplicate requests

## Rate Limiting

### Limits
- Maximum 60 requests per minute for task submissions
- Maximum 120 requests per minute for status checks
- Maximum 30 requests per minute for implementation retrievals

### Rate Limit Response
```json
{
  "success": false,
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded",
    "retryAfter": 30
  }
}
```

## Data Formats

### Date and Time
- All timestamps in ISO-8601 format
- Example: `2025-03-27T14:30:00Z`

### Text Encoding
- All text data UTF-8 encoded

### File Content
- Base64 encoded for binary files
- UTF-8 text for code and text files

## Implementation Guidelines

### AIACD Core Implementation
```javascript
// Example API client implementation
class BoltDiyClient {
  constructor(config) {
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
  }

  async submitTask(task) {
    try {
      const response = await fetch(`${this.apiUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': task.taskId
        },
        body: JSON.stringify(task)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting task:', error);
      throw error;
    }
  }

  // Additional methods for other endpoints
}
```

### bolt.diy Implementation
```javascript
// Example API endpoint implementation
app.post('/api/tasks', authenticateRequest, async (req, res) => {
  try {
    const task = req.body;
    
    // Validate task data
    if (!task.taskId || !task.description) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'invalid_request',
          message: 'Missing required fields'
        }
      });
    }
    
    // Store task in database
    await db.tasks.create(task);
    
    // Queue task for processing
    taskQueue.add(task);
    
    return res.status(201).json({
      success: true,
      taskId: task.taskId,
      status: 'received',
      estimatedCompletion: new Date(Date.now() + 60000).toISOString()
    });
  } catch (error) {
    console.error('Error processing task submission:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'server_error',
        message: 'Internal server error'
      }
    });
  }
});

// Additional endpoints
```

## Testing and Validation

### Testing Endpoints
- `/api/test/ping` - Simple connectivity test
- `/api/test/auth` - Authentication validation
- `/api/test/echo` - Request echo for debugging

### Validation Process
1. Validate authentication mechanisms
2. Test basic connectivity
3. Verify task submission workflow
4. Test error handling and recovery
5. Validate rate limiting and retry logic

## Monitoring and Logging

### Logging Requirements
- API requests and responses logged (excluding sensitive data)
- Errors logged with full context
- Performance metrics captured
- System events recorded

### Monitoring Metrics
- Request latency
- Error rates
- Success rates
- Token usage
- Rate limit status

## Implementation Timeline

### Phase 1: Basic Integration (1 Week)
- Implement authentication mechanism
- Create task submission endpoint
- Develop status check endpoint
- Set up basic error handling

### Phase 2: Complete API (1-2 Weeks)
- Implement all remaining endpoints
- Add comprehensive error handling
- Set up monitoring and logging
- Create validation test suite

### Phase 3: Optimization (1 Week)
- Performance tuning
- Security hardening
- Documentation updates
- Integration testing

## Security Considerations

### Data Protection
- No sensitive data in URL parameters
- API keys never logged or exposed
- Secure storage of credentials
- Minimal data retention policy

### Access Control
- Strict validation of API requests
- Permission-based access to resources
- Audit logging for sensitive operations
- Regular security reviews

This specification provides a comprehensive framework for implementing the API integration between AIACD Core and bolt.diy. It ensures secure, reliable, and efficient communication between the two systems while maintaining clear boundaries and responsibilities.