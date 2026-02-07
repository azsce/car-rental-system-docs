import React, { useEffect } from 'react';
import { useColorMode } from '@docusaurus/theme-common';

export default function Root({ children }) {
  const { colorMode } = useColorMode();

  useEffect(() => {
    // Function to fix Mermaid colors in dark mode
    const fixMermaidColors = () => {
      if (colorMode === 'dark') {
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
      observer.disconnect();
    };
  }, [colorMode]);

  return <>{children}</>;
}
