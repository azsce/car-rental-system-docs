import React, { useEffect } from 'react';

export default function Root({ children }) {
  useEffect(() => {
    // Function to fix Mermaid colors in dark mode
    const fixMermaidColors = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        // Find all Mermaid SVG containers
        const mermaidContainers = document.querySelectorAll('.docusaurus-mermaid-container svg');

        mermaidContainers.forEach((svg) => {
          // Get all rect elements in nodes
          const nodeRects = svg.querySelectorAll('.node rect.label-container');
          nodeRects.forEach((rect) => {
            // Remove the inline style attribute completely
            rect.removeAttribute('style');
            // Add a class for dark mode styling
            rect.classList.add('dark-mode-node');
          });

          // Get all rect elements in clusters
          const clusterRects = svg.querySelectorAll('.cluster > rect');
          clusterRects.forEach((rect) => {
            rect.removeAttribute('style');
            rect.classList.add('dark-mode-cluster');
          });
        });
      }
    };

    // Run immediately
    fixMermaidColors();

    // Run after multiple delays to catch dynamically loaded diagrams
    const timeoutId1 = setTimeout(fixMermaidColors, 100);
    const timeoutId2 = setTimeout(fixMermaidColors, 500);
    const timeoutId3 = setTimeout(fixMermaidColors, 1000);

    // Observe theme changes on html element
    const themeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          fixMermaidColors();
        }
      });
    });

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    // Observe DOM changes for dynamically loaded content
    const observer = new MutationObserver(() => {
      setTimeout(fixMermaidColors, 50);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      themeObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
}
