window.registerModule('quotations', async (container) => {
    container.innerHTML = `
        <div class="card" style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2>Quotations / Estimates</h2>
                <button class="btn btn-primary" onclick="window.renderPage('invoices')">
                    <i data-lucide="arrow-right"></i> Go to Invoices
                </button>
            </div>
            <p style="margin-top:10px; color:var(--text-muted); font-size:0.9rem;">
                Quotations act as draft invoices. To create a quotation for a client, use the <b>Invoices</b> engine and simply save it as <b>unpaid</b> before finalizing.
            </p>
        </div>
        <div class="grid-cards">
            <div class="card" style="display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:48px 24px;">
                <i data-lucide="file-text" style="width:48px;height:48px;color:var(--primary);margin-bottom:16px;"></i>
                <h3>Draft Quotes in Invoices</h3>
                <p style="color:var(--text-muted); margin-top:8px; margin-bottom:24px;">
                    Our advanced invoice engine handles all quotation math, services calculation, minimum charges, and GST logic.
                </p>
                <button class="btn btn-primary" onclick="window.renderPage('invoices')">Build Quotation (via Invoices)</button>
            </div>
        </div>
    `;
    lucide.createIcons();
});
