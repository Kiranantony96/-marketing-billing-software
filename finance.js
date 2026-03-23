window.registerModule('finance', async (container) => {
    container.innerHTML = `
        <div class="card" style="margin-bottom: 24px;">
            <h2>Financial Overview</h2>
            <p style="margin-top:10px; color:var(--text-muted); font-size:0.9rem;"><b>Formula:</b> netProfit = revenue - (expenses + salaries)</p>
        </div>
        <div id="finance-stats" class="dashboard-stats" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
            <div class="stat-card">
                <div class="stat-card-title">Total Revenue</div>
                <div class="stat-card-value" style="color:var(--success)" id="fin-revenue">₹0</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-title">Total Expenses</div>
                <div class="stat-card-value" style="color:var(--danger)" id="fin-expenses">₹0</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-title">Staff Salaries</div>
                <div class="stat-card-value" style="color:var(--warning)" id="fin-salaries">₹0</div>
            </div>
            <div class="stat-card" style="border:2px solid var(--primary); background:#fffaf5;">
                <div class="stat-card-title" style="color:var(--primary)">Net Profit</div>
                <div class="stat-card-value" style="color:var(--primary)" id="fin-profit">₹0</div>
            </div>
        </div>
        
        <div class="grid-cards" style="margin-top: 24px;">
            <div class="card">
                <h3>Recent Revenue</h3>
                <div id="finance-revenue-list" style="margin-top:16px;"></div>
            </div>
            <div class="card">
                <h3>Recent Deductions</h3>
                <div id="finance-expense-list" style="margin-top:16px;"></div>
            </div>
        </div>
    `;

    // Fetch required data
    const payments = await window.db.payments.toArray();
    const expenses = await window.db.expenses.toArray();
    const staff = await window.db.staff.toArray();
    const tasks = await window.db.tasks.toArray();

    // Calculate metrics
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    
    // Explicit salary calculation: staff fixed salaries + completed task commissions
    const fixedSalaries = staff.reduce((sum, s) => sum + (s.salaryType === 'fixed' ? Number(s.baseSalary) : 0), 0);
    const taskCommissions = tasks.reduce((sum, t) => sum + (t.status === 'done' ? Number(t.payment) : 0), 0);
    const totalSalaries = fixedSalaries + taskCommissions;

    const netProfit = totalRevenue - (totalExpenses + totalSalaries);

    // Update UI
    document.getElementById('fin-revenue').innerText = '₹' + totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    document.getElementById('fin-expenses').innerText = '₹' + totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    document.getElementById('fin-salaries').innerText = '₹' + totalSalaries.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    document.getElementById('fin-profit').innerText = '₹' + netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 });

    // Populate quick lists
    const revList = document.getElementById('finance-revenue-list');
    payments.reverse().slice(0, 5).forEach(p => {
        revList.innerHTML += `<div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border);">
            <span>Via ${p.method} <span style="font-size:0.8rem; color:var(--text-muted); display:block;">${p.date}</span></span>
            <span style="color:var(--success); font-weight:600;">+ ₹${Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>`;
    });
    if(payments.length === 0) revList.innerHTML = `<p class="text-muted" style="margin-top:10px;">No revenue data recorded.</p>`;

    const expList = document.getElementById('finance-expense-list');
    
    // Combine explicit expenses and completed staff task commissions for recent list
    let combinedDeductions = expenses.map(e => ({ name: e.title, category: e.category, amount: e.amount, date: e.date }));
    // Add completed tasks as deduction lines
    tasks.filter(t => t.status === 'done' && t.payment > 0).forEach(t => {
        combinedDeductions.push({ name: `Task: ${t.title}`, category: 'Staff Commission', amount: t.payment, date: t.deadline });
    });
    
    // Sort combined by rough date if possible, or just recent additions
    combinedDeductions.reverse().slice(0, 5).forEach(e => {
        expList.innerHTML += `<div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border);">
            <span>${e.name} <span style="font-size:0.8rem; color:var(--text-muted); display:block;">${e.category} | ${e.date||'N/A'}</span></span>
            <span style="color:var(--danger); font-weight:600;">- ₹${Number(e.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>`;
    });
    if(combinedDeductions.length === 0) expList.innerHTML = `<p class="text-muted" style="margin-top:10px;">No expenses or commissions data.</p>`;
});
