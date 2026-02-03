# Car Rental System Planning & Analysis

Comprehensive requirements engineering and system design documentation for a modern car rental platform graduation project.

## Overview

This project contains the planning and analysis phase documentation for a full-stack car rental system. It includes:

- Analysis of three open-source car rental projects (bookcars, car-rental-php, FreeCar)
- Market research on industry standards and best practices
- Stakeholder identification and analysis
- User workflows with visual Mermaid diagrams
- Comprehensive feature catalog
- Formal EARS-compliant requirements specification

## Project Structure

```
.
├── docs/                           # Documentation content
│   ├── intro.md                    # Landing page
│   ├── methodology/                # Analysis approach
│   ├── analysis/                   # Open-source project analysis
│   ├── research/                   # Market research findings
│   ├── stakeholders/               # Stakeholder analysis
│   ├── workflows/                  # User scenarios and workflows
│   ├── features/                   # Feature catalog
│   ├── requirements/               # Requirements specification
│   └── appendices/                 # Glossary, references, traceability
├── cloned-opensource-projects/     # Reference implementations
│   ├── bookcars/                   # Multi-platform Node.js solution
│   ├── car-rental-php/             # PHP monolithic implementation
│   └── FreeCar/                    # Go microservices architecture
├── src/                            # Docusaurus theme customization
├── static/                         # Static assets (images, diagrams)
├── docusaurus.config.ts            # Docusaurus configuration
├── sidebars.ts                     # Sidebar navigation structure
└── package.json                    # Dependencies and scripts
```

## Prerequisites

- **Bun** v1.0 or higher (package manager)
- **Node.js** v20.0 or higher
- **Prince XML** (optional, for PDF export)

## Installation

Install dependencies using Bun:

```bash
bun install
```

## Development

Start the development server with hot reload:

```bash
bun start
```

The documentation site will be available at `http://localhost:3000`.

## Building

Generate a production-ready static site:

```bash
bun run build
```

The built site will be in the `build/` directory.

## Serving Built Site

Preview the production build locally:

```bash
bun run serve
```

## PDF Export

Generate a PDF version of the complete documentation:

1. Start the development server:
   ```bash
   bun start
   ```

2. In a separate terminal, run the PDF export:
   ```bash
   bun run pdf
   ```

The PDF will be generated as `car-rental-planning.pdf` in the project root.

**Note**: PDF export requires Prince XML to be installed. Download from [https://www.princexml.com/](https://www.princexml.com/).

## Documentation Standards

### File Organization

- **Modular Structure**: Each document should be 150-400 lines maximum
- **Naming Convention**: Use kebab-case for all files and directories
- **Category Files**: Each section includes a `_category_.json` for metadata

### Markdown Format

All documentation files should include frontmatter:

```yaml
---
sidebar_position: 1
title: Document Title
description: Brief description for SEO and previews
tags: [tag1, tag2, tag3]
---
```

### Mermaid Diagrams

Use Mermaid for visual diagrams:

- **Flowcharts**: For decision-based processes
- **Sequence Diagrams**: For multi-actor interactions
- **State Diagrams**: For entity lifecycles

Example:

\`\`\`mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
\`\`\`

## Technology Stack

- **Docusaurus**: Documentation framework
- **React**: UI components
- **TypeScript**: Type-safe configuration
- **Mermaid**: Diagram generation
- **Prince XML**: PDF export

## Analyzed Projects

### 1. BookCars
- **Technology**: Node.js, TypeScript, MongoDB, React
- **Architecture**: Multi-platform (admin, frontend, backend, mobile)
- **Location**: `cloned-opensource-projects/bookcars/`

### 2. Car-Rental-PHP
- **Technology**: PHP, MySQL
- **Architecture**: Monolithic MVC
- **Location**: `cloned-opensource-projects/car-rental-php/`

### 3. FreeCar
- **Technology**: Go, Microservices
- **Architecture**: Cloud-native with service mesh
- **Location**: `cloned-opensource-projects/FreeCar/`

## Contributing

When adding documentation:

1. Follow the modular structure (one topic per file)
2. Include proper frontmatter with metadata
3. Use Mermaid for diagrams where appropriate
4. Keep files under 400 lines
5. Use technology-agnostic language when describing patterns
6. Cite sources for research findings

## Scripts Reference

| Script | Description |
|--------|-------------|
| `bun start` | Start development server with hot reload |
| `bun run build` | Build production static site |
| `bun run serve` | Serve production build locally |
| `bun run clear` | Clear Docusaurus cache |
| `bun run pdf` | Generate PDF export (requires Prince XML) |
| `bun run typecheck` | Run TypeScript type checking |

## License

This documentation is part of a graduation project and is intended for academic purposes.

## Contact

For questions or feedback about this documentation project, please contact the graduation project team.

---

**Built with Docusaurus** | **Powered by Bun**
