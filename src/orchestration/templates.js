/**
 * AI-AutoCoding-DAO Template Manager
 * Handles task templates for different AI tools
 */
class TemplateManager {
  constructor() {
    // Base templates for different tools
    this.templates = {
      haiku: {
        logicFunction: {
          template: `Task Type: Haiku - Logic Function
Token Budget: {tokenBudget}
Core Function:
{description}

Input Contract:
- Data types: {inputTypes}
- Validation rules: {validationRules}
- Edge cases: {edgeCases}

Output Contract:
- Return type: {returnType}
- Error handling: {errorHandling}
- Performance bounds: {performanceBounds}

Technical Context:
- Dependencies: {dependencies}
- Environment: {environment}
- Integration points: {integrationPoints}

Test Scenarios:
{testScenarios}`,
          defaults: {
            tokenBudget: '50-80',
            inputTypes: 'Specify input parameter types and constraints',
            validationRules: 'Required validation checks',
            edgeCases: 'List any critical edge cases to handle',
            returnType: 'Expected return type and structure',
            errorHandling: 'Error types to handle',
            performanceBounds: 'O(n) time, O(1) space',
            dependencies: 'List required imports/dependencies',
            environment: 'Node.js runtime',
            integrationPoints: 'N/A',
            testScenarios: '- Provide 2-3 key test cases with expected results'
          }
        },
        dataTransform: {
          template: `Task Type: Haiku - Data Transform
Token Budget: {tokenBudget}
Transform Specification:
{description}

Data Contracts:
Input Schema:
  - Fields: {inputFields}
  - Constraints: {inputConstraints}
Output Schema:
  - Fields: {outputFields}
  - Guarantees: {outputGuarantees}

Processing Rules:
- Transformations: {transformations}
- Validations: {validations}
- Error handling: {errorHandling}

Performance Requirements:
- Time complexity: {timeComplexity}
- Memory bounds: {memoryBounds}
- Scale factors: {scaleFactors}`,
          defaults: {
            tokenBudget: '50-80',
            inputFields: 'Input data fields and types',
            inputConstraints: 'Input validation rules',
            outputFields: 'Output data fields and types',
            outputGuarantees: 'Post-conditions and guarantees',
            transformations: 'Required data transformations',
            validations: 'Validation checks during processing',
            errorHandling: 'Error scenarios to handle',
            timeComplexity: 'O(n) time complexity',
            memoryBounds: 'O(n) space complexity',
            scaleFactors: 'Expected data size ranges'
          }
        },
        integration: {
          template: `Task Type: Haiku - Integration
Token Budget: {tokenBudget}
Integration Purpose:
{description}

Interface Contract:
Source:
  - Service: {sourceService}
  - Methods: {sourceMethods}
  - Auth: {sourceAuth}
Target:
  - Service: {targetService}
  - Methods: {targetMethods}
  - Auth: {targetAuth}

Data Flow:
- Request mapping: {requestMapping}
- Response handling: {responseHandling}
- Error scenarios: {errorScenarios}

Operational Requirements:
- Timeout: {timeout}
- Retry policy: {retryPolicy}
- Circuit breaker: {circuitBreaker}`,
          defaults: {
            tokenBudget: '50-80',
            sourceService: 'Source API/service name',
            sourceMethods: 'Available source endpoints',
            sourceAuth: 'Authentication requirements',
            targetService: 'Target API/service name',
            targetMethods: 'Required target endpoints',
            targetAuth: 'Authentication requirements',
            requestMapping: 'How to map request data',
            responseHandling: 'How to process responses',
            errorScenarios: 'Error handling approach',
            timeout: 'Timeout limits',
            retryPolicy: 'Retry strategy',
            circuitBreaker: 'Failure thresholds'
          }
        }
      },
      boltNew: {
        basicUI: {
          template: `Task Type: bolt.new - UI Component
Component Class: {componentClass}
Visual Contract:
- Layout: {layout}
- Spacing: {spacing}
- Typography: {typography}
- Colors: {colors}

Behavioral Contract:
- States: {states}
- Animations: {animations}
- Interactions: {interactions}

Props Interface:
- Required:
  {requiredProps}
- Optional:
  {optionalProps}

Accessibility Requirements:
- ARIA roles: {ariaRoles}
- Keyboard nav: {keyboardNav}
- Screen reader: {screenReader}

Platform Requirements:
- Responsive: {responsive}
- Browser support: {browserSupport}
- Performance: {performance}`,
          defaults: {
            componentClass: 'Atomic',
            layout: 'Flexbox/Grid specifications',
            spacing: 'Margin/Padding system',
            typography: 'Font styles and sizes',
            colors: 'Color scheme references',
            states: 'Default, hover, active, disabled',
            animations: 'Transition effects',
            interactions: 'Click, hover, focus events',
            requiredProps: '- name: type, validation',
            optionalProps: '- name: type, default',
            ariaRoles: 'Required ARIA roles',
            keyboardNav: 'Tab order, key bindings',
            screenReader: 'Text alternatives',
            responsive: 'Breakpoint specifications',
            browserSupport: 'Required browser versions',
            performance: 'Render targets'
          }
        },
        advancedComponent: {
          template: `Task Type: bolt.new - Complex Component
Component Scope:
{description}

State Management:
Internal State:
  - States: {internalStates}
  - Reducers: {stateReducers}
External State:
  - Context: {contextDependencies}
  - Props: {propsInterface}

Event System:
Inputs:
  - Events: {inputEvents}
  - Handlers: {eventHandlers}
Outputs:
  - Events: {outputEvents}
  - Payloads: {eventPayloads}

Subcomponents:
- Components: {childComponents}
- Composition: {compositionRules}
- Communication: {componentCommunication}

Technical Requirements:
- Dependencies: {dependencies}
- Performance: {performanceRequirements}
- Testing: {testingStrategy}`,
          defaults: {
            internalStates: 'Component state definitions',
            stateReducers: 'State transition functions',
            contextDependencies: 'Required context providers',
            propsInterface: 'Props interface specification',
            inputEvents: 'Events to handle',
            eventHandlers: 'Event processing logic',
            outputEvents: 'Events to emit',
            eventPayloads: 'Event data structures',
            childComponents: 'Subcomponent list',
            compositionRules: 'Layout and composition rules',
            componentCommunication: 'Inter-component communication',
            dependencies: 'Required libraries',
            performanceRequirements: 'Performance targets',
            testingStrategy: 'Test cases and approach'
          }
        },
        smartComponent: {
          template: `Task Type: bolt.new - Smart Component
Component Function:
{description}

Data Layer:
- Sources: {dataSources}
- Models: {dataModels}
- Operations: {dataOperations}

UI Layer:
- Views: {viewComponents}
- States: {uiStates}
- Feedback: {userFeedback}

Business Logic:
- Rules: {businessRules}
- Validations: {dataValidations}
- Workflows: {processFlows}

Integration Points:
- Services: {serviceIntegrations}
- Events: {systemEvents}
- Storage: {dataStorage}`,
          defaults: {
            dataSources: 'Data providers/APIs',
            dataModels: 'Data structure definitions',
            dataOperations: 'CRUD operations',
            viewComponents: 'UI components used',
            uiStates: 'UI state definitions',
            userFeedback: 'User feedback mechanisms',
            businessRules: 'Business logic rules',
            dataValidations: 'Data validation rules',
            processFlows: 'Process workflows',
            serviceIntegrations: 'Service API endpoints',
            systemEvents: 'System event handling',
            dataStorage: 'Data persistence approach'
          }
        }
      },
      v0Dev: {
        designSystem: {
          template: `Task Type: v0.dev - Design System
System Scope:
{description}

Foundation:
Colors:
  - Primary: {primaryColors}
  - Secondary: {secondaryColors}
  - Semantic: {semanticColors}
Typography:
  - Families: {fontFamilies}
  - Scale: {fontSizes}
  - Styles: {textStyles}
Spacing:
  - Grid: {gridSystem}
  - Components: {componentSpacing}
  - Responsive: {responsiveRules}

Component Tokens:
- Inputs: {inputStyles}
- Containers: {containerStyles}
- Navigation: {navigationStyles}

Pattern Library:
- Forms: {formPatterns}
- Lists: {listPatterns}
- Cards: {cardPatterns}

Implementation:
- Variables: {cssVariables}
- Mixins: {styleMixins}
- Functions: {utilityFunctions}`,
          defaults: {
            primaryColors: 'Primary color tokens',
            secondaryColors: 'Secondary color tokens',
            semanticColors: 'Status/feedback colors',
            fontFamilies: 'Typography families',
            fontSizes: 'Typography size scale',
            textStyles: 'Text style variants',
            gridSystem: 'Layout grid definition',
            componentSpacing: 'Component spacing rules',
            responsiveRules: 'Responsive breakpoints',
            inputStyles: 'Input control styles',
            containerStyles: 'Container element styles',
            navigationStyles: 'Navigation element styles',
            formPatterns: 'Form layout patterns',
            listPatterns: 'List style patterns',
            cardPatterns: 'Card component patterns',
            cssVariables: 'CSS variable definitions',
            styleMixins: 'Sass/CSS mixins',
            utilityFunctions: 'Utility functions'
          }
        },
        pattern: {
          template: `Task Type: v0.dev - Pattern
Pattern Purpose:
{description}

Visual Design:
- Layout: {layoutStructure}
- Components: {uiElements}
- States: {visualStates}

Interaction Design:
- Triggers: {userTriggers}
- Feedback: {systemFeedback}
- Transitions: {stateTransitions}

Content Design:
- Copy: {textElements}
- Media: {mediaTypes}
- Data: {dynamicContent}

Technical Design:
- Structure: {htmlPattern}
- Styling: {cssPattern}
- Behavior: {jsPattern}`,
          defaults: {
            layoutStructure: 'Layout structure specification',
            uiElements: 'UI components used',
            visualStates: 'Visual state definitions',
            userTriggers: 'User action triggers',
            systemFeedback: 'System response types',
            stateTransitions: 'State transition rules',
            textElements: 'Text content types',
            mediaTypes: 'Media asset types',
            dynamicContent: 'Dynamic content structure',
            htmlPattern: 'HTML structure pattern',
            cssPattern: 'CSS styling approach',
            jsPattern: 'JavaScript behavior pattern'
          }
        },
        theme: {
          template: `Task Type: v0.dev - Theme
Theme Scope:
{description}

Base Theme:
- Variables: {themeTokens}
- Overrides: {styleOverrides}
- Extensions: {themeExtensions}

Component Themes:
- Elements: {elementStyles}
- Variants: {styleVariants}
- States: {stateStyles}

Integration:
- Application: {themeApplication}
- Customization: {customizationOptions}
- Compatibility: {compatibilityRequirements}`,
          defaults: {
            themeTokens: 'Theme token definitions',
            styleOverrides: 'Style override definitions',
            themeExtensions: 'Theme extension points',
            elementStyles: 'Component element styles',
            styleVariants: 'Component style variants',
            stateStyles: 'Component state styles',
            themeApplication: 'Theme application rules',
            customizationOptions: 'Customization options',
            compatibilityRequirements: 'System compatibility requirements'
          }
        }
      },
      claudeDirect: {
        general: {
          template: `# Task Specification

## Component: {componentName}

### Description
{description}

### Requirements
{requirements}

### Technical Details
{technicalDetails}

### Implementation Notes
{implementationNotes}

### Examples
{examples}`,
          defaults: {
            componentName: '[Component Name]',
            requirements: '- List key requirements here\n- Be specific and detailed\n- Include acceptance criteria',
            technicalDetails: '- Technical constraints\n- Integration points\n- Performance requirements',
            implementationNotes: '- Important implementation considerations\n- Architectural patterns to use\n- Known challenges',
            examples: '- Example usage or similar components\n- Code snippets where helpful\n- References'
          }
        }
      }
    };
  }

  /**
   * Get available template types for a specific tool
   * @param {string} tool - The AI tool name
   * @returns {string[]} Available template types
   */
  getTemplateTypes(tool) {
    if (!this.templates[tool]) {
      return [];
    }

    return Object.keys(this.templates[tool]);
  }

  /**
   * Get a template based on tool, type, and task details
   * @param {string} tool - The AI tool name
   * @param {string} type - The template type
   * @param {Object} task - The task details
   * @returns {string|null} Filled template or null if not found
   */
  getTemplate(tool, type, task) {
    // Check if the tool and type exist
    if (!this.templates[tool] || !this.templates[tool][type]) {
      return null;
    }

    const { template, defaults } = this.templates[tool][type];
    
    // Fill template with task details and defaults
    let filledTemplate = template;
    
    // Replace description
    filledTemplate = filledTemplate.replace('{description}', task.description || '[Description]');
    
    // Replace other placeholders with task details or defaults
    for (const [key, defaultValue] of Object.entries(defaults)) {
      const placeholder = `{${key}}`;
      const value = task[key] || defaultValue;
      filledTemplate = filledTemplate.replace(placeholder, value);
    }
    
    return filledTemplate;
  }

  /**
   * Get the most appropriate template type for a task
   * @param {string} tool - The AI tool name
   * @param {Object} task - The task details
   * @returns {string|null} Best template type or null if not available
   */
  getBestTemplateType(tool, task) {
    if (!this.templates[tool]) {
      return null;
    }
    
    const types = this.getTemplateTypes(tool);
    
    // Handle tool-specific selection logic
    switch (tool) {
      case 'haiku': 
        return this._getBestHaikuTemplateType(task);
      case 'boltNew':
        return this._getBestBoltTemplateType(task);
      case 'v0Dev':
        return this._getBestV0DevTemplateType(task);
      case 'claudeDirect':
        // Claude Direct only has one general template
        return 'general';
      default:
        // Default to first available template type
        return types.length > 0 ? types[0] : null;
    }
  }
  
  /**
   * Select the best Haiku template type for a task
   * @private
   * @param {Object} task - The task details
   * @returns {string} Template type
   */
  _getBestHaikuTemplateType(task) {
    const taskType = task.type?.toLowerCase();
    
    // Data transformation template
    if (taskType?.includes('data') || 
        taskType?.includes('transform') || 
        task.description?.toLowerCase().includes('data') ||
        task.description?.toLowerCase().includes('transform')) {
      return 'dataTransform';
    }
    
    // Integration template
    if (taskType?.includes('integration') || 
        taskType?.includes('connect') || 
        task.description?.toLowerCase().includes('integration') ||
        task.description?.toLowerCase().includes('api') ||
        task.description?.toLowerCase().includes('service')) {
      return 'integration';
    }
    
    // Default to logic function template
    return 'logicFunction';
  }
  
  /**
   * Select the best Bolt.new template type for a task
   * @private
   * @param {Object} task - The task details
   * @returns {string} Template type
   */
  _getBestBoltTemplateType(task) {
    const taskType = task.type?.toLowerCase();
    const description = task.description?.toLowerCase() || '';
    const complexity = task.complexity?.toLowerCase() || 'medium';
    
    // Smart component for complex tasks with data and business logic
    if ((complexity === 'high' || description.includes('smart')) && 
        (description.includes('data') || description.includes('business logic') || 
         description.includes('service') || description.includes('api'))) {
      return 'smartComponent';
    }
    
    // Advanced component for more complex UIs
    if (complexity === 'high' || complexity === 'medium' || 
        description.includes('complex') || description.includes('advanced') ||
        description.includes('state') || description.includes('events')) {
      return 'advancedComponent';
    }
    
    // Default to basic UI component
    return 'basicUI';
  }
  
  /**
   * Select the best v0.dev template type for a task
   * @private
   * @param {Object} task - The task details
   * @returns {string} Template type
   */
  _getBestV0DevTemplateType(task) {
    const description = task.description?.toLowerCase() || '';
    
    // Design system template
    if (description.includes('design system') || 
        description.includes('component library') || 
        description.includes('ui library')) {
      return 'designSystem';
    }
    
    // Theme template
    if (description.includes('theme') || 
        description.includes('styling') || 
        description.includes('color scheme')) {
      return 'theme';
    }
    
    // Default to pattern template
    return 'pattern';
  }
  
  /**
   * Generate a token-optimized task template
   * @param {Object} task - The task details 
   * @param {string} tool - The AI tool to generate for
   * @returns {string} The filled template
   */
  generateTemplate(task, tool) {
    // Get the best template type for this task and tool
    const templateType = this.getBestTemplateType(tool, task);
    
    if (!templateType) {
      // Fallback to a generic template if no specific template is found
      return `# Task: ${task.description}\n\nRequirements:\n- Implement the described functionality\n- Follow best practices\n- Ensure code quality`;
    }
    
    // Get and fill the template
    return this.getTemplate(tool, templateType, task);
  }
  
  /**
   * Create a new custom template
   * @param {string} tool - The AI tool name
   * @param {string} type - The template type
   * @param {string} template - The template content
   * @param {Object} defaults - Default values
   * @returns {boolean} Success
   */
  createTemplate(tool, type, template, defaults) {
    // Initialize tool if not exists
    if (!this.templates[tool]) {
      this.templates[tool] = {};
    }
    
    // Add or update template
    this.templates[tool][type] = {
      template,
      defaults: defaults || {}
    };
    
    return true;
  }
  
  /**
   * Update an existing template
   * @param {string} tool - The AI tool name
   * @param {string} type - The template type
   * @param {string} template - The new template content
   * @param {Object} defaults - New default values
   * @returns {boolean} Success
   */
  updateTemplate(tool, type, template, defaults) {
    // Check if the template exists
    if (!this.templates[tool] || !this.templates[tool][type]) {
      return false;
    }
    
    // Update template
    if (template) {
      this.templates[tool][type].template = template;
    }
    
    // Update defaults if provided
    if (defaults) {
      this.templates[tool][type].defaults = {
        ...this.templates[tool][type].defaults,
        ...defaults
      };
    }
    
    return true;
  }
  
  /**
   * Delete a template
   * @param {string} tool - The AI tool name
   * @param {string} type - The template type
   * @returns {boolean} Success
   */
  deleteTemplate(tool, type) {
    // Check if the template exists
    if (!this.templates[tool] || !this.templates[tool][type]) {
      return false;
    }
    
    // Delete template
    delete this.templates[tool][type];
    
    return true;
  }
}

module.exports = TemplateManager;
