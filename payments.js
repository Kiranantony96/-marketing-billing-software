window.registerModule('payments', async (container) => {
    container.innerHTML = `
        <div class="card" style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2>Payments Tracking</h2>
                <button class="btn btn-primary" onclick="window.PaymentsApp.openModal()"><i data-lucide="plus"></i> Record Payment</button>
            </div>
            <p style="margin-top:10px; color:var(--text-muted); font-size:0.9rem;">Formula: balance = totalAmount - paidAmount</p>
        </div>
        <div id="payments-list" class="grid-cards"></div>

        <div id="payment-modal" class="modal hidden">
            <div class="modal-content card" style="max-width: 500px; margin: 50px auto;">
                <h3 id="payment-modal-title">Record Payment</h3>
                <form id="payment-form" style="display:flex; flex-direction:column; gap:16px; margin-top:16px;">
                    <div>
                        <label>Invoice</label><br>
                        <select id="pay-inv" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;" onchange="window.PaymentsApp.updateAmountHint()"></select>
                    </div>
                    <div>
                        <label>Amount (₹) <span id="pay-hint" style="color:var(--text-muted);font-size:0.8rem;"></span></label><br>
                        <input type="number" id="pay-amount" required min="1" step="any" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div>
                        <label>Payment Method</label><br>
                        <select id="pay-method" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                            <option value="cash">Cash</option>
                            <option value="bank">Bank Transfer</option>
                            <option value="upi">UPI</option>
                        </select>
                    </div>
                    <div>
                        <label>Date</label><br>
                        <input type="date" id="pay-date" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    
                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        <button type="button" class="btn btn-secondary" onclick="window.PaymentsApp.closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Payment</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    window.PaymentsApp = {
        unpaidInvoicesData: {},
        updateAmountHint: () => {
            const v = document.getElementById('pay-inv').value;
            if(v && window.PaymentsApp.unpaidInvoicesData[v]) {
                const inv = window.PaymentsApp.unpaidInvoicesData[v];
                document.getElementById('pay-hint').innerText = '(Balance: ₹'+inv.balance+')';
                document.getElementById('pay-amount').value = inv.balance;
                document.getElementById('pay-amount').max = inv.balance; // Prevent overpayment in UI
            } else {
                document.getElementById('pay-hint').innerText = '';
            }
        },
        openModal: async () => {
            document.getElementById('payment-modal').classList.remove('hidden');
            document.getElementById('payment-form').reset();
            
            const td = new Date().toISOString().split('T')[0];
            document.getElementById('pay-date').value = td;
            
            const invoices = await window.db.invoices.toArray();
            const unpaid = invoices.filter(i => i.status !== 'paid');
            
            window.PaymentsApp.unpaidInvoicesData = {};
            
            const invSelect = document.getElementById('pay-inv');
            if(unpaid.length === 0){
                invSelect.innerHTML = `<option value="">-- No pending invoices --</option>`;
                document.getElementById('pay-amount').removeAttribute('max');
                document.getElementById('pay-hint').innerText = '';
            } else {
                for (let i of unpaid) {
                    const paymentsRaw = await window.db.payments.where('invoiceId').equals(i.id).toArray();
                    const paidAmount = paymentsRaw.reduce((sum, pk) => sum + Number(pk.amount), 0);
                    const balance = i.total - paidAmount;
                    window.PaymentsApp.unpaidInvoicesData[i.id] = { ...i, balance };
                }
                
                // Remove fully paid invoices from dropdown (just in case they slipped through)
                const options = Object.values(window.PaymentsApp.unpaidInvoicesData).filter(i => i.balance > 0);
                
                if(options.length === 0) {
                    invSelect.innerHTML = `<option value="">-- No pending invoices --</option>`;
                } else {
                    invSelect.innerHTML = `<option value="">-- Select Invoice --</option>` + options.map(i => `<option value="${i.id}">INV-${i.invoiceNumber} (Bal: ₹${i.balance.toFixed(2)})</option>`).join('');
                }
            }
        },
        closeModal: () => document.getElementById('payment-modal').classList.add('hidden'),
        loadPayments: async () => {
            const payments = await window.db.payments.toArray();
            const invoices = await window.db.invoices.toArray();
            const invMap = {}; invoices.forEach(i => invMap[i.id] = i.invoiceNumber);

            const listDiv = document.getElementById('payments-list');
            if(payments.length === 0){
                listDiv.innerHTML = `<div class="card" style="grid-column: 1/-1"><p class="text-muted">No payments recorded.</p></div>`;
                return;
            }
            payments.reverse();
            listDiv.innerHTML = payments.map(p => `
                <div class="card">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h3 style="font-size:1.4rem; color:var(--success);">+ ₹${Number(p.amount).toFixed(2)}</h3>
                        <span style="background:#f1f5f9; padding:4px 8px; border-radius:4px; font-size:0.75rem; text-transform:uppercase; font-weight:600; color:var(--text-main); border:1px solid var(--border);">${p.method}</span>
                    </div>
                    <div style="margin-top:12px; font-size:0.9rem; color:var(--text-muted); border-top:1px dashed var(--border); padding-top:12px; display:flex; justify-content:space-between;">
                        <span><i data-lucide="file-text" style="width:14px;height:14px;vertical-align:middle;"></i> INV-${invMap[p.invoiceId] || 'Deleted'}</span>
                        <span><i data-lucide="calendar" style="width:14px;height:14px;vertical-align:middle;"></i> ${p.date}</span>
                    </div>
                </div>
            `).join('');
            lucide.createIcons();
        }
    };

    document.getElementById('payment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const invId = Number(document.getElementById('pay-inv').value);
        if(!invId) return alert('Select a valid invoice.');
        const amount = Number(document.getElementById('pay-amount').value);
        
        await window.db.payments.add({
            invoiceId: invId,
            amount: amount,
            method: document.getElementById('pay-method').value,
            date: document.getElementById('pay-date').value
        });
        
        // Update Invoice status/balance
        const inv = await window.db.invoices.get(invId);
        if(inv) {
            const allPaymentsRaw = await window.db.payments.where('invoiceId').equals(invId).toArray();
            const paidAmount = allPaymentsRaw.reduce((sum, pk) => sum + Number(pk.amount), 0);
            const balance = inv.total - paidAmount;
            
            let status = 'unpaid';
            if(balance <= 0) status = 'paid';
            else if(paidAmount > 0) status = 'partial';
            
            await window.db.invoices.update(invId, { status: status });
        }
        
        window.PaymentsApp.closeModal();
        await window.PaymentsApp.loadPayments();
    });

    await window.PaymentsApp.loadPayments();
});
