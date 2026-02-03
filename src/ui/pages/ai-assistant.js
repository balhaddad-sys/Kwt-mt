/**
 * AI Assistant Page
 * Chat interface with structured clinical output
 */
import { AI } from '../../services/ai.service.js';

let messagesContainer = null;
let inputElement = null;
let isLoading = false;

export function renderAIAssistant(container) {
  container.innerHTML = `
    <div class="page-ai">
      <header class="ai-header glass-header">
        <h2>AI Clinical Assistant</h2>
        <div class="ai-context-toggle">
          <label class="toggle-label">
            <input type="checkbox" id="include-context" />
            <span>Include patient context</span>
          </label>
        </div>
      </header>

      <div class="ai-disclaimer">
        <span class="disclaimer-icon">\u26A0\uFE0F</span>
        <span>AI-generated suggestions. Always verify with clinical judgment and current guidelines.</span>
      </div>

      <main class="ai-messages" id="ai-messages">
        <!-- Messages render here -->
        <div class="ai-welcome">
          <div class="ai-welcome-icon">\uD83E\uDE7A</div>
          <h3>Clinical Decision Support</h3>
          <p>Ask clinical questions, analyze labs, or get drug information.</p>

          <div class="ai-suggestions">
            <button class="btn btn-secondary" data-prompt="What are the causes of acute kidney injury?">
              AKI Causes
            </button>
            <button class="btn btn-secondary" data-prompt="Interpret elevated troponin levels">
              Troponin Interpretation
            </button>
            <button class="btn btn-secondary" data-prompt="Antibiotic coverage for community-acquired pneumonia">
              CAP Antibiotics
            </button>
          </div>
        </div>
      </main>

      <footer class="ai-input-area">
        <div class="ai-input-wrapper">
          <textarea
            class="input ai-input"
            id="ai-input"
            placeholder="Ask a clinical question..."
            rows="1"
          ></textarea>
          <button class="btn btn-primary btn-icon ai-send" id="ai-send" disabled>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </footer>
    </div>
  `;

  messagesContainer = container.querySelector('#ai-messages');
  inputElement = container.querySelector('#ai-input');
  const sendButton = container.querySelector('#ai-send');
  const contextToggle = container.querySelector('#include-context');

  // Auto-resize textarea
  inputElement.addEventListener('input', () => {
    inputElement.style.height = 'auto';
    inputElement.style.height = Math.min(inputElement.scrollHeight, 120) + 'px';
    sendButton.disabled = !inputElement.value.trim();
  });

  // Send on Enter (Shift+Enter for newline)
  inputElement.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Send button
  sendButton.addEventListener('click', sendMessage);

  // Suggestion buttons
  container.querySelectorAll('[data-prompt]').forEach(btn => {
    btn.addEventListener('click', () => {
      inputElement.value = btn.dataset.prompt;
      inputElement.dispatchEvent(new Event('input'));
      sendMessage();
    });
  });

  async function sendMessage() {
    const question = inputElement.value.trim();
    if (!question || isLoading) return;

    // Clear welcome if first message
    const welcome = messagesContainer.querySelector('.ai-welcome');
    if (welcome) welcome.remove();

    // Add user message
    appendMessage('user', question);

    // Clear input
    inputElement.value = '';
    inputElement.style.height = 'auto';
    sendButton.disabled = true;

    // Get patient context if enabled
    const includeContext = contextToggle.checked;
    const context = includeContext ? getPatientContext() : null;

    // Show loading
    const loadingId = appendMessage('assistant', null, true);
    isLoading = true;

    try {
      const response = await AI.askClinical(question, context);

      // Replace loading with response
      updateMessage(loadingId, response);

    } catch (error) {
      updateMessage(loadingId, {
        sections: {
          error: {
            type: 'text',
            content: 'Sorry, I encountered an error processing your request. Please try again.'
          }
        }
      });
    } finally {
      isLoading = false;
    }
  }
}

function appendMessage(role, content, loading = false) {
  const id = 'msg-' + Date.now();
  const msg = document.createElement('div');
  msg.className = `ai-message ai-message-${role}`;
  msg.id = id;

  if (role === 'user') {
    msg.innerHTML = `
      <div class="ai-message-content">
        <p>${escapeHtml(content)}</p>
      </div>
    `;
  } else if (loading) {
    msg.innerHTML = `
      <div class="ai-message-content">
        <div class="ai-loading">
          <span class="ai-loading-dot"></span>
          <span class="ai-loading-dot"></span>
          <span class="ai-loading-dot"></span>
        </div>
      </div>
    `;
  }

  messagesContainer.appendChild(msg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  return id;
}

function updateMessage(id, response) {
  const msg = document.getElementById(id);
  if (!msg) return;

  const content = msg.querySelector('.ai-message-content');
  content.innerHTML = renderStructuredResponse(response);

  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function renderStructuredResponse(response) {
  const sections = response.sections || {};

  let html = '<div class="ai-structured-response">';

  // Render each section
  const sectionLabels = {
    assessment: '\uD83D\uDCCB Assessment',
    red_flags: '\uD83D\uDEA8 Red Flags',
    immediate_actions: '\u26A1 Immediate Actions',
    differential: '\uD83D\uDD0D Differential Diagnosis',
    workup: '\uD83D\uDD2C Workup',
    treatment: '\uD83D\uDC8A Treatment',
    dosing: '\uD83D\uDCCA Dosing',
    references: '\uD83D\uDCDA References',
    error: '\u274C Error'
  };

  for (const [key, section] of Object.entries(sections)) {
    const label = sectionLabels[key] || key;
    const isRedFlag = key === 'red_flags' || key === 'immediate_actions';

    html += `
      <div class="ai-section ${isRedFlag ? 'ai-section-urgent' : ''}">
        <h4 class="ai-section-title">${label}</h4>
        <div class="ai-section-content">
          ${renderSectionContent(section)}
        </div>
      </div>
    `;
  }

  // Disclaimer
  html += `
    <div class="ai-response-footer">
      <span class="ai-disclaimer-small">
        ${response.disclaimer || 'Verify with clinical judgment'}
      </span>
      ${response.latencyMs ? `<span class="ai-latency">${response.latencyMs}ms</span>` : ''}
    </div>
  `;

  html += '</div>';

  return html;
}

function renderSectionContent(section) {
  if (!section) return '';

  if (section.type === 'list') {
    return `
      <ul class="ai-list">
        ${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    `;
  }

  return `<p>${escapeHtml(section.content || section)}</p>`;
}

function getPatientContext() {
  // In a real app, this would come from the store/state
  return null;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
