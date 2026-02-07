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
          // Remove inline fill styles from rect elements
          const rects = svg.querySelectorAll('rect[style*="fill"]');
          rects.forEach((rect) => {
            // Check if it's a node (not a cluster)
            const isNode = rect.closest('.node');
            const isCluster = rect.closest('.cluster') && !isNode;
            
            if (isNode) {
              rect.style.fill = '#334155';
              rect.style.stroke = '#60a5fa';
              rect.style.strokeWidth = '2px';
            } else if (isCluster) {
              rect.style.fill = '#1e293b';
              rect.style.stroke = '#475569';
              rect.style.strokeWidth = '2px';
            }
          });
        });
      }
    };

    // Run immediately
    fixMermaidColors();

    // Run after a short delay to catch dynamically loaded diagrams
    const timeoutId = setTimeout(fixMermaidColors, 100);

    // Observe DOM changes for dynamically loaded content
    const observer = new MutationObserver(fixMermaidColors);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [colorMode]);

  return <>{children}</>;
}
