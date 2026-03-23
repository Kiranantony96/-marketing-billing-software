window.registerModule('recurring', async (container) => {
    container.innerHTML = `
        <div class="card" style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2>Recurring Subscriptions</h2>
                <button class="btn btn-primary" onclick="window.RecurringApp.openModal()"><i data-lucide="refresh-cw"></i> New Subscription</button>
            </div>
            <p style="margin-top:10px; color:var(--text-muted); font-size:0.9rem;">Track monthly retainers, hosting, or SLA plans.</p>
        </div>
        <div id="recurring-list" class="grid-cards"></div>

        <div id="recurring-modal" class="modal hidden">
            <div class="modal-content card" style="max-width: 500px; margin: 50px auto;">
                <h3 id="recurring-modal-title">New Recurring Plan</h3>
                <form id="recurring-form" style="display:flex; flex-direction:column; gap:16px; margin-top:16px;">
                    <input type="hidden" id="rec-id" />
                    <div>
                        <label>Title / Service</label><br>
                        <input type="text" id="rec-title" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div>
                        <label>Client</label><br>
                        <select id="rec-client" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;"></select>
                    </div>
                    <div>
                        <label>Amount / Cycle (₹)</label><br>
                        <input type="number" id="rec-amount" required min="0" step="any" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div style="display:flex; gap:16px;">
                        <div style="flex:1">
                            <label>Billing Cycle</label><br>
                            <select id="rec-type" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                        <div style="flex:1">
                            <label>Next Billing Date</label><br>
                            <input type="date" id="rec-date" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                        </div>
                    </div>
                    <div>
                        <label>Status</label><br>
                        <select id="rec-status" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    
                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        <button type="button" class="btn btn-secondary" onclick="window.RecurringApp.closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    window.RecurringApp = {
        openModal: async (rec = null) => {
            document.getElementById('recurring-modal').classList.remove('hidden');
            document.getElementById('recurring-modal-title').innerText = rec ? 'Edit Subscription' : 'New Subscription';
            
            document.getElementById('rec-id').value = rec ? rec.id : '';
            document.getElementById('rec-title').value = rec ? rec.title : '';
            document.getElementById('rec-amount').value = rec ? rec.amount : '';
            document.getElementById('rec-type').value = rec ? rec.type : 'monthly';
            document.getElementById('rec-status').value = rec ? rec.status : 'active';
            
            if(rec && rec.nextBillingDate) {
                document.getElementById('rec-date').value = rec.nextBillingDate;
            } else {
                const tr = new Date();
                tr.setMonth(tr.getMonth() + 1);
                document.getElementById('rec-date').value = tr.toISOString().split('T')[0];
            }

            const clients = await window.db.clients.toArray();
            const clientSelect = document.getElementById('rec-client');
            if(clients.length === 0){
                clientSelect.innerHTML = `<option value="">-- No clients --</option>`;
            } else {
                clientSelect.innerHTML = clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
                if(rec && rec.clientId) clientSelect.value = rec.clientId;
            }
        },
        closeModal: () => document.getElementById('recurring-modal').classList.add('hidden'),
        loadRecurring: async () => {
            const list = await window.db.recurring.toArray();
            const clients = await window.db.clients.toArray();
            const cMap = {}; clients.forEach(c => cMap[c.id] = c.name);

            const container = document.getElementById('recurring-list');
            if(list.length === 0){
                container.innerHTML = `<div class="card" style="grid-column: 1/-1"><p class="text-muted">No recurring billing setups found.</p></div>`;
                return;
            }
            container.innerHTML = list.map(r => {
                let sColor = r.status === 'active' ? 'var(--success)' : (r.status === 'paused' ? 'var(--warning)' : 'var(--danger)');
                return `
                <div class="card">
                    <div style="display:flex; justify-content:space-between;">
                        <h3 style="font-size:1.1rem;">${r.title}</h3>
                        <button class="btn-icon" onclick='window.RecurringApp.edit(${JSON.stringify(r).replace(/'/g, "&#39;")})'><i data-lucide="edit"></i></button>
                    </div>
                    <p style="color:var(--primary); font-size:0.875rem; font-weight:600; margin-top:4px;">${cMap[r.clientId] || 'Unknown Client'}</p>
                    <div style="margin-top:16px; font-size:0.9rem; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <span style="font-weight:700; font-size:1.1rem;">₹${r.amount}</span> <span style="color:var(--text-muted); font-size:0.8rem;">/ ${r.type}</span>
                            <div style="color:var(--text-main); font-size:0.8rem; margin-top:6px;"><i data-lucide="calendar" style="width:12px;height:12px;vertical-align:middle;"></i> Next: ${r.nextBillingDate}</div>
                        </div>
                        <span style="background:${sColor}; color:white; padding:4px 8px; border-radius:12px; font-size:0.7rem; font-weight:bold; letter-spacing:0.5px; text-transform:uppercase;">${r.status}</span>
                    </div>
                </div>
            `}).join('');
            lucide.createIcons();
        },
        edit: (rec) => window.RecurringApp.openModal(rec)
    };

    document.getElementById('recurring-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('rec-id').value;
        const cId = Number(document.getElementById('rec-client').value);
        if(!cId) return alert("Select a valid client.");

        const data = {
            title: document.getElementById('rec-title').value,
            clientId: cId,
            amount: Number(document.getElementById('rec-amount').value),
            type: document.getElementById('rec-type').value,
            nextBillingDate: document.getElementById('rec-date').value,
            status: document.getElementById('rec-status').value
        };

        if(id) await window.db.recurring.update(Number(id), data);
        else await window.db.recurring.add(data);

        window.RecurringApp.closeModal();
        await window.RecurringApp.loadRecurring();
    });

    await window.RecurringApp.loadRecurring();
});
