window.registerModule('invoices', async (container) => {
    container.innerHTML = `
        <div class="card" style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2>Invoices</h2>
                <button class="btn btn-primary" onclick="window.InvoicesApp.openModal()"><i data-lucide="file-plus"></i> Create Invoice</button>
            </div>
        </div>
        <div id="invoices-list" class="grid-cards"></div>

        <!-- Create Invoice Modal (full screen overlay) -->
        <div id="invoice-modal" class="modal hidden">
            <div class="modal-content card" style="max-width: 800px; margin: 20px auto; height: 90vh; overflow-y: auto;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:16px;">
                    <h3 id="invoice-modal-title">Create Invoice</h3>
                    <button class="btn-icon" onclick="window.InvoicesApp.closeModal()"><i data-lucide="x"></i></button>
                </div>
                
                <form id="invoice-form" style="display:flex; flex-direction:column; gap:16px;">
                    <div style="display:flex; gap:16px;">
                        <div style="flex:1;">
                            <label>Client</label><br>
                            <select id="inv-client" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;"></select>
                        </div>
                        <div style="flex:1;">
                            <label>Date</label><br>
                            <input type="date" id="inv-date" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                        </div>
                        <div style="flex:1;">
                            <label>Due Date</label><br>
                            <input type="date" id="inv-due" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                        </div>
                    </div>

                    <div style="border: 1px solid var(--border); border-radius: 8px; padding: 16px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <h4 style="margin-bottom:12px;">Invoice Items</h4>
                            <button type="button" class="btn btn-secondary btn-sm" onclick="window.InvoicesApp.addItem()"><i data-lucide="plus"></i> Add Item</button>
                        </div>
                        <table style="width:100%; border-collapse:collapse; text-align:left;">
                            <thead>
                                <tr style="border-bottom:1px solid var(--border);">
                                    <th style="padding:8px 0;">Item/Service</th>
                                    <th>Qty/Base</th>
                                    <th>Rate/Fixed (₹)</th>
                                    <th>Total (₹)</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody id="invoice-items"></tbody>
                        </table>
                    </div>

                    <div style="display:flex; gap:16px; align-items:flex-start;">
                        <div style="flex:1;">
                            <label>Notes / Terms</label><br>
                            <textarea id="inv-notes" rows="4" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">Payment due within 15 days.</textarea>
                        </div>
                        <div style="width:300px; background:#f8fafc; padding:16px; border-radius:8px; border:1px solid var(--border);">
                            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                <span>Subtotal:</span>
                                <span id="inv-lbl-subtotal">₹0.00</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <span>Discount (₹):</span>
                                <input type="number" id="inv-discount" value="0" min="0" oninput="window.InvoicesApp.calcTotals()" style="width:80px; padding:4px;">
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                                <span><input type="checkbox" id="inv-gst-check" checked onchange="window.InvoicesApp.calcTotals()"> Apply GST (18%)</span>
                                <span id="inv-lbl-gst">₹0.00</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; font-weight:700; font-size:1.2rem; border-top:1px solid var(--border); padding-top:12px;">
                                <span>Total:</span>
                                <span id="inv-lbl-total">₹0.00</span>
                            </div>
                        </div>
                    </div>

                    <div style="display:flex; justify-content:flex-end;">
                        <button type="submit" class="btn btn-primary">Save Invoice</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    window.InvoicesApp = {
        itemsCount: 0,
        servicesMap: {},
        calcTotals: () => {
            let subtotal = 0;
            const rows = document.querySelectorAll('.inv-item-row');
            rows.forEach(row => {
                const total = parseFloat(row.querySelector('.item-total').value) || 0;
                subtotal += total;
            });

            const discount = parseFloat(document.getElementById('inv-discount').value) || 0;
            let finalSub = subtotal - discount;
            if(finalSub < 0) finalSub = 0;
            
            let gst = 0;
            if(document.getElementById('inv-gst-check').checked) {
                gst = finalSub * 0.18;
            }
            
            const total = finalSub + gst;

            document.getElementById('inv-lbl-subtotal').innerText = '₹' + subtotal.toFixed(2);
            document.getElementById('inv-lbl-gst').innerText = '₹' + gst.toFixed(2);
            document.getElementById('inv-lbl-total').innerText = '₹' + total.toFixed(2);
        },
        onServiceChange: (rowId) => {
            const row = document.getElementById(rowId);
            const srvId = row.querySelector('.item-select').value;
            if(srvId && window.InvoicesApp.servicesMap[srvId]) {
                const s = window.InvoicesApp.servicesMap[srvId];
                let basePrice = 0;
                if(s.type === 'unit') basePrice = s.unitPrice || 0;
                else if(s.type === 'percentage') basePrice = (s.percent || 0)/100;
                else basePrice = s.defaultPrice || 0;
                row.querySelector('.item-price').value = basePrice;
            }
            window.InvoicesApp.updateRowTotal(rowId);
        },
        updateRowTotal: (rowId) => {
            const row = document.getElementById(rowId);
            const srvId = row.querySelector('.item-select').value;
            const qty = parseFloat(row.querySelector('.item-qty').value) || 1;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            
            let lineTotal = qty * price;
            
            if(srvId && window.InvoicesApp.servicesMap[srvId]) {
                const s = window.InvoicesApp.servicesMap[srvId];
                if((s.minCharge || 0) > lineTotal) {
                    lineTotal = s.minCharge;
                }
            }
            
            if(lineTotal < 0) lineTotal = 0;
            row.querySelector('.item-total').value = lineTotal.toFixed(2);
            window.InvoicesApp.calcTotals();
        },
        addItem: () => {
            window.InvoicesApp.itemsCount++;
            const id = 'inv-row-' + window.InvoicesApp.itemsCount;
            const tr = document.createElement('tr');
            tr.id = id;
            tr.className = 'inv-item-row';
            tr.innerHTML = `
                <td style="padding:8px 0;">
                    <select class="item-select input-field" style="width:90%; padding:6px;" onchange="window.InvoicesApp.onServiceChange('${id}')">
                        <option value="">Custom Item...</option>
                        ${Object.values(window.InvoicesApp.servicesMap).map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                    </select>
                </td>
                <td><input type="number" class="item-qty input-field" value="1" min="1" step="any" style="width:80px; padding:6px;" oninput="window.InvoicesApp.updateRowTotal('${id}')"></td>
                <td><input type="number" class="item-price input-field" value="0" min="0" step="any" style="width:100px; padding:6px;" oninput="window.InvoicesApp.updateRowTotal('${id}')"></td>
                <td><input type="number" class="item-total input-field" value="0" readonly style="width:100px; padding:6px; background:#f1f5f9; border:none; font-weight:600;"></td>
                <td><button type="button" class="btn-icon" style="color:var(--danger)" onclick="document.getElementById('${id}').remove(); window.InvoicesApp.calcTotals();"><i data-lucide="trash-2"></i></button></td>
            `;
            document.getElementById('invoice-items').appendChild(tr);
            lucide.createIcons();
        },
        openModal: async () => {
            document.getElementById('invoice-modal').classList.remove('hidden');
            document.getElementById('invoice-form').reset();
            document.getElementById('invoice-items').innerHTML = '';
            
            const td = new Date().toISOString().split('T')[0];
            document.getElementById('inv-date').value = td;
            
            const d = new Date(); d.setDate(d.getDate() + 15);
            document.getElementById('inv-due').value = d.toISOString().split('T')[0];
            
            // Client dropdown
            const clients = await window.db.clients.toArray();
            const clientSelect = document.getElementById('inv-client');
            if(clients.length === 0){
                clientSelect.innerHTML = `<option value="">-- No Clients Found --</option>`;
            } else {
                clientSelect.innerHTML = clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            }
            
            // Map services
            const services = await window.db.services.toArray();
            window.InvoicesApp.servicesMap = {};
            services.forEach(s => window.InvoicesApp.servicesMap[s.id] = s);
            
            window.InvoicesApp.addItem();
            window.InvoicesApp.calcTotals();
        },
        closeModal: () => document.getElementById('invoice-modal').classList.add('hidden'),
        loadInvoices: async () => {
            const invoices = await window.db.invoices.toArray();
            const clients = await window.db.clients.toArray();
            const cMap = {}; clients.forEach(c => cMap[c.id] = c.name);
            
            const listDiv = document.getElementById('invoices-list');
            if(invoices.length === 0){
                listDiv.innerHTML = `<div class="card" style="grid-column: 1/-1"><p class="text-muted">No invoices generated yet.</p></div>`;
                return;
            }
            
            invoices.reverse(); // newest first
            listDiv.innerHTML = invoices.map(inv => `
                <div class="card">
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                        <h3 style="font-size:1.1rem; color:var(--text-main);">INV-${inv.invoiceNumber}</h3>
                        <span style="background:${inv.status==='paid'?'var(--success)':'var(--warning)'}; color:white; padding:4px 8px; border-radius:12px; font-size:0.75rem; font-weight:bold; letter-spacing:0.5px; text-transform:uppercase;">${inv.status}</span>
                    </div>
                    <p style="font-weight:600; font-size:1rem; color:var(--primary);">${cMap[inv.clientId]||'Unknown Client'}</p>
                    <div style="margin-top:12px; font-size:0.85rem; color:var(--text-muted); display:flex; flex-direction:column; gap:4px;">
                        <div style="display:flex; justify-content:space-between;"><span>Issue Date:</span> <span style="color:var(--text-main); font-weight:500;">${inv.date}</span></div>
                        <div style="display:flex; justify-content:space-between;"><span>Due Date:</span> <span style="color:var(--text-main); font-weight:500;">${inv.dueDate || '-'}</span></div>
                    </div>
                    <div style="margin-top:16px; border-top:1px solid var(--border); padding-top:12px; display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="font-size:1.4rem; color:var(--text-main);">₹${inv.total.toFixed(2)}</h2>
                        <div style="display:flex; gap:10px;">
                            <button class="btn btn-secondary btn-sm" onclick="window.InvoicesApp.deleteInvoice(${inv.id})" style="color:var(--danger)"><i data-lucide="trash-2"></i> Delete</button>
                            <button class="btn btn-primary btn-sm" onclick="window.InvoicesApp.printInvoice(${inv.id})"><i data-lucide="printer"></i> Print / PDF</button>
                        </div>
                    </div>
                </div>
            `).join('');
            lucide.createIcons();
        },
        deleteInvoice: async (id) => {
            if(confirm('Are you sure you want to delete this invoice?')) {
                await window.db.invoices.delete(id);
                await window.InvoicesApp.loadInvoices();
            }
        },
        printInvoice: async (id) => {
            const inv = await window.db.invoices.get(id);
            const client = await window.db.clients.get(inv.clientId);
            const settings = await window.db.settings.get('config');
            
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                <head>
                    <title>Invoice INV-${inv.invoiceNumber}</title>
                    <style>
                        body { font-family: 'Inter', Arial, sans-serif; padding: 40px; color: #333; }
                        .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                        th { background-color: #f8f9fa; }
                        .totals { width: 40%; float: right; }
                        .totals table { border: none; }
                        .totals th, .totals td { border: none; padding: 8px; }
                        .totals td { text-align: right; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div>
                            <h2>${settings?.companyName || 'Your Company Name'}</h2>
                            <p>${settings?.address || ''}</p>
                            <p>Phone: ${settings?.phone || ''} | Email: ${settings?.email || ''}</p>
                            <p>GSTIN: ${settings?.gstNumber || 'N/A'}</p>
                        </div>
                        <div style="text-align: right;">
                            <h1 style="color: #ff6a00; margin: 0;">INVOICE</h1>
                            <p><strong>Invoice Number:</strong> INV-${inv.invoiceNumber}</p>
                            <p><strong>Date:</strong> ${inv.date}</p>
                            <p><strong>Due Date:</strong> ${inv.dueDate || 'N/A'}</p>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 40px;">
                        <h3>Billed To:</h3>
                        <p><strong>${client.name}</strong></p>
                        <p>${client.company || ''}</p>
                        <p>${client.email}</p>
                        <p>${client.phone}</p>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Qty</th>
                                <th>Rate (₹)</th>
                                <th style="text-align: right;">Total (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${inv.items.map(item => `
                                <tr>
                                    <td>${window.InvoicesApp.servicesMap[item.srvId]?.name || 'Custom Service'}</td>
                                    <td>${item.qty}</td>
                                    <td>₹${Number(item.price).toFixed(2)}</td>
                                    <td style="text-align: right;">₹${Number(item.total).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="totals">
                        <table>
                            <tr><th>Subtotal:</th><td>₹${Number(inv.subtotal).toFixed(2)}</td></tr>
                            <tr><th>Discount:</th><td>₹${Number(inv.discount).toFixed(2)}</td></tr>
                            <tr><th>GST (+18%):</th><td>₹${Number(inv.gst).toFixed(2)}</td></tr>
                            <tr style="font-size: 1.2em; font-weight: bold; border-top: 2px solid #ddd;">
                                <th>Total:</th><td>₹${Number(inv.total).toFixed(2)}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="clear: both;"></div>
                    <div style="margin-top: 50px; font-size: 0.9em; color: #666; border-top: 1px solid #eee; padding-top: 20px;">
                        <p><strong>Bank Details:</strong><br>${(settings?.bankDetails || '').replace(/\\n/g, '<br>')}</p>
                        <p>Thank you for your business!</p>
                    </div>
                    <script>
                        window.onload = () => window.print();
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    document.getElementById('invoice-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const clientVal = document.getElementById('inv-client').value;
        if(!clientVal) return alert('Please add a client first to create invoices.');

        let subtotal = 0;
        const items = [];
        document.querySelectorAll('.inv-item-row').forEach(row => {
            const srvId = row.querySelector('.item-select').value;
            const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            const total = parseFloat(row.querySelector('.item-total').value) || 0;
            items.push({ srvId, qty, price, total });
            subtotal += total;
        });

        const discount = parseFloat(document.getElementById('inv-discount').value) || 0;
        let gst = 0;
        if(document.getElementById('inv-gst-check').checked) {
            gst = Math.max(subtotal - discount, 0) * 0.18;
        }
        
        const total = Math.max(subtotal - discount, 0) + gst;

        const data = {
            invoiceNumber: Date.now().toString().slice(-6),
            clientId: Number(clientVal),
            date: document.getElementById('inv-date').value,
            dueDate: document.getElementById('inv-due').value,
            items: items,
            subtotal: subtotal,
            discount: discount,
            gst: gst,
            total: total,
            status: 'unpaid'
        };

        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Saving...';

        await window.db.invoices.add(data);
        window.InvoicesApp.closeModal();
        await window.InvoicesApp.loadInvoices();

        submitBtn.disabled = false;
        submitBtn.innerText = 'Save Invoice';
    });

    await window.InvoicesApp.loadInvoices();
});
