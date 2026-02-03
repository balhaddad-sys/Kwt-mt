/**
 * Handover Page
 * Patient selection, QR generation, and receiving
 */
import { Handover } from '../../services/handover.service.js';

let selectedPatients = new Set();

export function renderHandover(container) {
  container.innerHTML = `
    <div class="page-handover">
      <header class="handover-header">
        <h2>Patient Handover</h2>
      </header>

      <div class="handover-tabs">
        <button class="tab-btn active" data-tab="send">Send Handover</button>
        <button class="tab-btn" data-tab="receive">Receive Handover</button>
      </div>

      <!-- Send Tab -->
      <div class="handover-tab-content" id="tab-send">
        <div class="handover-section">
          <h3>Select Patients</h3>
          <p class="text-secondary">Choose patients to hand over to the next team</p>

          <div class="patient-select-list" id="patient-select-list">
            <!-- Patient checkboxes render here -->
            <div class="empty-state">
              <p>No active patients to hand over</p>
            </div>
          </div>
        </div>

        <div class="handover-actions">
          <div class="handover-count">
            <span id="selected-count">0</span> patients selected
          </div>
          <button class="btn btn-primary btn-lg" id="generate-qr" disabled>
            Generate QR Code
          </button>
        </div>
      </div>

      <!-- Receive Tab -->
      <div class="handover-tab-content hidden" id="tab-receive">
        <div class="handover-section receive-section">
          <div class="receive-icon">\uD83D\uDCF7</div>
          <h3>Scan Handover QR</h3>
          <p class="text-secondary">Scan the QR code from the sending device to receive patients</p>

          <button class="btn btn-primary btn-lg" id="scan-qr">
            <span>\uD83D\uDCF7</span> Scan QR Code
          </button>

          <div class="receive-divider">
            <span>or</span>
          </div>

          <button class="btn btn-secondary" id="enter-code">
            Enter Code Manually
          </button>
        </div>
      </div>
    </div>
  `;

  // Tab switching
  const tabs = container.querySelectorAll('.tab-btn');
  const tabContents = container.querySelectorAll('.handover-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      tabContents.forEach(content => {
        content.classList.toggle('hidden', content.id !== `tab-${tab.dataset.tab}`);
      });
    });
  });

  // Generate QR
  container.querySelector('#generate-qr').addEventListener('click', () => generateQR(container));

  // Scan QR
  container.querySelector('#scan-qr').addEventListener('click', scanQR);

  // Manual code entry
  container.querySelector('#enter-code').addEventListener('click', enterCodeManually);
}

function updateSelectedCount(container) {
  const countEl = container.querySelector('#selected-count');
  const generateBtn = container.querySelector('#generate-qr');

  countEl.textContent = selectedPatients.size;
  generateBtn.disabled = selectedPatients.size === 0;
}

async function generateQR(container) {
  if (selectedPatients.size === 0) return;

  try {
    const { handover, qrDataUrl, expiresIn } = await Handover.generateHandover(
      Array.from(selectedPatients)
    );

    // Show QR in a simple modal overlay
    const modal = document.createElement('div');
    modal.className = 'qr-scanner-modal';
    modal.style.background = 'rgba(0,0,0,0.8)';
    modal.innerHTML = `
      <div class="qr-scanner-content glass" style="padding: 24px; text-align: center;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3>Handover QR Code</h3>
          <button class="btn btn-ghost btn-icon qr-close">\u2715</button>
        </div>

        <div class="qr-display">
          <div class="qr-image-container">
            <img src="${qrDataUrl}" alt="Handover QR Code" class="qr-image" />
          </div>

          <div class="qr-info">
            <h4>${handover.patientCount} Patient${handover.patientCount > 1 ? 's' : ''}</h4>
            <p class="text-secondary">
              ${handover.patients.map(p => p.name).join(', ')}
            </p>
          </div>

          <div class="qr-expiry">
            <span>\u23F1\uFE0F</span>
            <span>Expires in <strong id="expiry-countdown">${Math.floor(expiresIn / 60)}:00</strong></span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.qr-close').addEventListener('click', () => modal.remove());

    // Countdown timer
    let remaining = expiresIn;
    const countdownEl = modal.querySelector('#expiry-countdown');
    const interval = setInterval(() => {
      remaining--;
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      countdownEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

      if (remaining <= 0) {
        clearInterval(interval);
        modal.remove();
      }
    }, 1000);

  } catch (error) {
    console.error('[Handover] Generate failed:', error);
  }
}

async function scanQR() {
  try {
    const qrData = await Handover.scanQR();

    // Fetch full handover data
    const handover = await Handover.fetchHandover(qrData.id, qrData.hash);

    // Show confirmation
    showReceiveConfirmation(handover);

  } catch (error) {
    if (error.message !== 'Cancelled') {
      console.error('[Handover] Scan failed:', error);
    }
  }
}

function showReceiveConfirmation(handover) {
  const modal = document.createElement('div');
  modal.className = 'qr-scanner-modal';
  modal.style.background = 'rgba(0,0,0,0.8)';
  modal.innerHTML = `
    <div class="qr-scanner-content glass" style="padding: 24px;">
      <h3 style="margin-bottom: 16px;">Incoming Handover</h3>

      <div class="receive-confirmation">
        <div class="receive-from">
          <span class="text-secondary">From:</span>
          <strong>${handover.fromUser?.name || handover.fromUser?.email || 'Unknown'}</strong>
          <span class="text-muted">${handover.fromUnit?.name || ''}</span>
        </div>

        <div class="receive-patients">
          <h4>${handover.patientCount} Patient${handover.patientCount > 1 ? 's' : ''}</h4>
          <ul class="receive-patient-list">
            ${(handover.patients || []).map(p => `
              <li>
                <span class="patient-name">${p.name}</span>
                ${p.bed ? `<span class="patient-bed">Bed ${p.bed}</span>` : ''}
                <span class="badge badge-count">${(p.tasks || []).length} tasks</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="receive-actions">
          <button class="btn btn-secondary" id="decline-handover">Decline</button>
          <button class="btn btn-primary" id="accept-handover">Accept Handover</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('#decline-handover').addEventListener('click', () => {
    modal.remove();
  });

  modal.querySelector('#accept-handover').addEventListener('click', async () => {
    try {
      const results = await Handover.acceptHandover(handover, 'default');
      modal.remove();
      console.log('[Handover] Accepted:', results);
    } catch (error) {
      console.error('[Handover] Accept failed:', error);
    }
  });
}

function enterCodeManually() {
  const modal = document.createElement('div');
  modal.className = 'qr-scanner-modal';
  modal.style.background = 'rgba(0,0,0,0.8)';
  modal.innerHTML = `
    <div class="qr-scanner-content glass" style="padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3>Enter Handover Code</h3>
        <button class="btn btn-ghost btn-icon qr-close">\u2715</button>
      </div>
      <div class="input-group">
        <label class="input-label">Handover Code</label>
        <input type="text" class="input" id="manual-code" placeholder="Enter code from sending device" style="width: 100%; padding: 12px; margin: 8px 0;" />
      </div>
      <button class="btn btn-primary btn-lg" id="submit-code" style="width: 100%; margin-top: 16px;">
        Retrieve Handover
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.qr-close').addEventListener('click', () => modal.remove());

  modal.querySelector('#submit-code').addEventListener('click', async () => {
    const code = modal.querySelector('#manual-code').value.trim();
    if (!code) return;

    try {
      const handover = await Handover.fetchHandover(code, null);
      modal.remove();
      showReceiveConfirmation(handover);
    } catch (error) {
      console.error('[Handover] Manual code failed:', error);
    }
  });
}

function printHandoverSummary(handover) {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Handover Summary</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 18px; border-bottom: 2px solid #000; padding-bottom: 8px; }
        .patient { margin-bottom: 24px; page-break-inside: avoid; }
        .patient-header { display: flex; justify-content: space-between; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 8px; }
        .patient-name { font-weight: bold; font-size: 16px; }
        .tasks { margin-left: 20px; }
        .task { margin: 4px 0; }
        .meta { color: #666; font-size: 12px; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <h1>Patient Handover - ${new Date().toLocaleDateString()}</h1>
      <p class="meta">From: ${handover.fromUser.name || handover.fromUser.email} | Unit: ${handover.fromUnit.name}</p>

      ${handover.patients.map(p => `
        <div class="patient">
          <div class="patient-header">
            <span class="patient-name">${p.name}</span>
            <span>${p.bed ? `Bed ${p.bed}` : ''} ${p.mrn ? `| MRN: ${p.mrn}` : ''}</span>
          </div>
          <p><strong>Diagnosis:</strong> ${p.diagnosis || 'Not specified'}</p>
          ${p.notes ? `<p><strong>Notes:</strong> ${p.notes}</p>` : ''}
          ${(p.tasks || []).length > 0 ? `
            <p><strong>Pending Tasks:</strong></p>
            <ul class="tasks">
              ${p.tasks.map(t => `<li class="task">${t.text}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}

export { printHandoverSummary };
