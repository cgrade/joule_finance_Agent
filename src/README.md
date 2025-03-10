# Source Code Directory

This is the main source directory for the Joule Finance Twitter Agent.

## Directory Structure

- **agent/**: Core agent implementation
- **agents/**: Specialized agents (reader, writer, posting)
- **charts/**: Data visualization components
- **clients/**: External API client wrappers
- **knowledge/**: Knowledge base management
- **state/**: Agent state management
- **tools/**: Tool implementations for agent capabilities
- **types/**: TypeScript type definitions
- **utils/**: Utility functions and helpers
- **workflow/**: Agent workflow orchestration

## Key Files

- **index.ts**: Main application entry point
- **config.ts**: Configuration management
- **test-chart.ts**: Chart generation testing
- **test-tweet.ts**: Twitter posting testing
- **test-chart-post.ts**: Complete chart+post testing
- **poster.ts**: Tweet posting logic
- **reply-monitor.ts**: Twitter reply monitoring

## Getting Started for Developers

1. Begin by reviewing the `index.ts` file to understand the application flow
2. See `charts/` for visualization implementation
3. See `tools/` for core capabilities
4. See `workflow/` for agent orchestration

## Development Workflow

1. Run tests with test-\*.ts files
2. Make changes to specific modules
3. Update corresponding README.md files
4. Test integration points

## Architecture Overview

The application follows a modular design with clear separation of concerns:

- Data access is handled by tools
- Visualization is handled by the chart factory
- Content generation uses templates and LLMs
- State management is centralized
- Agent workflow provides orchestration
