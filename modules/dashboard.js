window.registerModule('dashboard', async (container) => {
    container.innerHTML = `
        <div class="dashboard-stats" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:20px; margin-bottom:24px;">
            <div class="stat-card" style="border-left:4px solid var(--primary)">
                <div class="stat-card-title">Active Projects</div>
                <div class="stat-card-value" id="dash-projects">0</div>
            </div>
            <div class="stat-card" style="border-left:4px solid var(--warning)">
                <div class="stat-card-title">Unpaid Invoices</div>
                <div class="stat-card-value" id="dash-invoices">0</div>
            </div>
            <div class="stat-card" style="border-left:4px solid var(--success)">
                <div class="stat-card-title">Monthly Revenue</div>
                <div class="stat-card-value" id="dash-revenue">₹0</div>
            </div>
            <div class="stat-card" style="border-left:4px solid var(--danger)">
                <div class="stat-card-title">Pending Tasks</div>
                <div class="stat-card-value" id="dash-tasks">0</div>
            </div>
        </div>
        <div class="grid-cards" style="grid-template-columns: 2fr 1fr; gap:24px;">
            <div class="card" style="display:flex; flex-direction:column; gap:16px;">
                <h3 style="border-bottom:1px solid var(--border); padding-bottom:12px;">Recent Unpaid Invoices</h3>
                <div id="dash-recent-inv" style="display:flex; flex-direction:column; gap:12px;"></div>
                <button class="btn btn-secondary" style="align-self:flex-start;" onclick="window.renderPage('invoices')">View All Invoices</button>
            </div>
            <div class="card" style="display:flex; flex-direction:column; gap:16px;">
                <h3 style="border-bottom:1px solid var(--border); padding-bottom:12px;">Quick Actions</h3>
                <button class="btn btn-primary" style="justify-content:center; padding:12px;" onclick="window.renderPage('invoices')"><i data-lucide="file-plus"></i> Create Invoice</button>
                <button class="btn btn-secondary" style="justify-content:center; padding:12px;" onclick="window.renderPage('payments')"><i data-lucide="indian-rupee"></i> Record Payment</button>
                <button class="btn btn-secondary" style="justify-content:center; padding:12px;" onclick="window.renderPage('projects')"><i data-lucide="briefcase"></i> New Project</button>
                <button class="btn btn-secondary" style="justify-content:center; padding:12px;" onclick="window.renderPage('tasks')"><i data-lucide="check-square"></i> Assign Task</button>
            </div>
        </div>
    `;

    // Fetch Stats
    const activeProjects = await window.db.projects.where('status').notEqual('done').count();
    document.getElementById('dash-projects').innerText = activeProjects;

    const unpaidInvoicesAll = await window.db.invoices.toArray();
    const unpaidInvoices = unpaidInvoicesAll.filter(i => i.status !== 'paid');
    document.getElementById('dash-invoices').innerText = unpaidInvoices.length;

    const pendingTasks = await window.db.tasks.where('status').notEqual('done').count();
    document.getElementById('dash-tasks').innerText = pendingTasks;

    const currMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
    const payments = await window.db.payments.toArray();
    const monthlyRev = payments.filter(p => p.date.startsWith(currMonthStr)).reduce((s, p) => s + Number(p.amount), 0);
    document.getElementById('dash-revenue').innerText = '₹' + monthlyRev.toLocaleString('en-IN', {minimumFractionDigits:0});

    // Recent Inv
    const recentDiv = document.getElementById('dash-recent-inv');
    const recentMts = unpaidInvoices.reverse().slice(0, 4);
    if(recentMts.length === 0){
        recentDiv.innerHTML = `<p class="text-muted">No unpaid invoices.</p>`;
    } else {
        const cMap = {};
        const clients = await window.db.clients.toArray();
        clients.forEach(c => cMap[c.id]=c.name);

        recentDiv.innerHTML = recentMts.map(inv => `
            <div style="background:#f8fafc; padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-weight:600; color:var(--text-main);">INV-${inv.invoiceNumber}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">${cMap[inv.clientId]||'Unknown'}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:700; color:var(--warning);">₹${inv.total.toFixed(2)}</div>
                    <div style="font-size:0.75rem; color:var(--danger);">Due: ${inv.dueDate}</div>
                </div>
            </div>
        `).join('');
    }
    lucide.createIcons();
});
