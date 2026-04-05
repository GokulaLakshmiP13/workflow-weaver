/**
 * Web Component wrapper for the Marketing Workflow Builder.
 * 
 * Usage in any HTML page:
 *   <script src="workflow-builder.js"></script>
 *   <marketing-workflow-builder></marketing-workflow-builder>
 * 
 * To build as standalone:
 *   npx vite build --config vite.webcomponent.config.ts
 * 
 * This file uses React to render inside a Shadow DOM,
 * making it framework-agnostic from the consumer's perspective.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { WorkflowBuilder } from '@/components/workflow/WorkflowBuilder';

class MarketingWorkflowBuilder extends HTMLElement {
  private root: ReturnType<typeof createRoot> | null = null;

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
    `;
    shadow.appendChild(style);

    // Import global styles
    const linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = '/src/index.css';
    shadow.appendChild(linkEl);

    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    shadow.appendChild(container);

    this.root = createRoot(container);
    this.root.render(React.createElement(WorkflowBuilder));
  }

  disconnectedCallback() {
    this.root?.unmount();
  }
}

// Register the custom element
if (!customElements.get('marketing-workflow-builder')) {
  customElements.define('marketing-workflow-builder', MarketingWorkflowBuilder);
}

export { MarketingWorkflowBuilder };
