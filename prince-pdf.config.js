/**
 * Prince PDF Configuration for Academic Documentation
 * 
 * This configuration ensures the PDF export meets academic standards:
 * - Proper page margins (1 inch all sides)
 * - Page numbers in footer
 * - Chapter titles in header
 * - Professional typography
 * - Table of contents with page numbers
 */

module.exports = {
  // PDF metadata
  title: 'Car Rental System Planning & Analysis',
  author: 'Car Rental Planning Team',
  subject: 'Graduation Project Documentation',
  keywords: 'car rental, requirements engineering, system analysis, documentation',
  
  // Prince PDF specific options
  princeArgs: [
    // PDF metadata
    '--pdf-title="Car Rental System Planning & Analysis"',
    '--pdf-author="Car Rental Planning Team"',
    '--pdf-subject="Graduation Project Documentation"',
    '--pdf-keywords="car rental, requirements engineering, system analysis"',
    
    // Page setup
    '--page-size=letter',
    '--page-margin=1in',
    
    // Typography
    '--no-artificial-fonts',
    
    // JavaScript support for Mermaid diagrams
    '--javascript',
    
    // Compression
    '--compress',
    
    // PDF version
    '--pdf-profile=PDF/A-1b',
  ],
  
  // Output file
  output: 'car-rental-planning.pdf',
  
  // Base URL for the documentation site
  baseUrl: 'http://localhost:3000',
  
  // Paths to include in PDF (in order)
  include: [
    '/docs/intro',
    '/docs/analysis',
    '/docs/research',
    '/docs/stakeholders',
    '/docs/workflows',
    '/docs/features',
    '/docs/requirements',
    '/docs/appendices',
  ],
  
  // Paths to exclude from PDF
  exclude: [
    '/blog',
    '/search',
  ],
  
  // Wait time for JavaScript to render (important for Mermaid diagrams)
  waitForTimeout: 5000,
  
  // Custom CSS for PDF (already included in custom.css)
  customCss: './src/css/custom.css',
};
