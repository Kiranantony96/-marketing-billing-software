window.registerModule('settings', async (container) => {
    container.innerHTML = `
        <div class="card" style="margin-bottom: 24px;">
            <h2>Settings</h2>
            <p style="margin-top:10px; color:var(--text-muted); font-size:0.9rem;">Manage seller details and data backups.</p>
        </div>
        <div class="grid-cards">
            <div class="card">
                <h3>Seller / Company Details</h3>
                <form id="settings-form" style="display:flex; flex-direction:column; gap:16px; margin-top:16px;">
                    <div>
                        <label>Company Name</label><br>
                        <input type="text" id="set-company" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div>
                        <label>Address</label><br>
                        <textarea id="set-addr" rows="3" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;"></textarea>
                    </div>
                    <div style="display:flex; gap:16px;">
                        <div style="flex:1">
                            <label>Phone</label><br>
                            <input type="text" id="set-phone" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                        </div>
                        <div style="flex:1">
                            <label>Email</label><br>
                            <input type="email" id="set-email" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                        </div>
                    </div>
                    <div>
                        <label>GST Number</label><br>
                        <input type="text" id="set-gst" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div>
                        <label>Bank Details</label><br>
                        <textarea id="set-bank" rows="3" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;"></textarea>
                    </div>
                    <div style="display:flex; justify-content:flex-end;">
                        <button type="submit" class="btn btn-primary">Save Details</button>
                    </div>
                </form>
            </div>
            <div class="card">
                <h3>Data Management</h3>
                <div style="margin-top:16px; display:flex; flex-direction:column; gap:12px;">
                    <button class="btn btn-secondary" onclick="window.SettingsApp.exportData()"><i data-lucide="download"></i> Export JSON Backup</button>
                    <div>
                        <input type="file" id="import-file" style="display:none;" accept=".json" onchange="window.SettingsApp.importData(event)">
                        <button class="btn btn-secondary" style="width:100%" onclick="document.getElementById('import-file').click()"><i data-lucide="upload"></i> Import JSON Backup</button>
                    </div>
                    <button class="btn btn-primary" style="background:var(--danger); color:white; border:none; margin-top:24px;" onclick="window.SettingsApp.resetData()"><i data-lucide="trash-2"></i> Reset Application Data</button>
                </div>
            </div>
        </div>
    `;

    window.SettingsApp = {
        loadSettings: async () => {
            const row = await window.db.settings.get('config');
            if(row) {
                document.getElementById('set-company').value = row.companyName || '';
                document.getElementById('set-addr').value = row.address || '';
                document.getElementById('set-phone').value = row.phone || '';
                document.getElementById('set-email').value = row.email || '';
                document.getElementById('set-gst').value = row.gstNumber || '';
                document.getElementById('set-bank').value = row.bankDetails || '';
            }
        },
        exportData: async () => {
            const data = {
                clients: await window.db.clients.toArray(),
                projects: await window.db.projects.toArray(),
                services: await window.db.services.toArray(),
                invoices: await window.db.invoices.toArray(),
                payments: await window.db.payments.toArray(),
                recurring: await window.db.recurring.toArray(),
                staff: await window.db.staff.toArray(),
                tasks: await window.db.tasks.toArray(),
                expenses: await window.db.expenses.toArray(),
                settings: await window.db.settings.toArray()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'markeledger_backup.json';
            a.click();
            URL.revokeObjectURL(url);
        },
        importData: async (e) => {
            const file = e.target.files[0];
            if(!file) return;
            const reader = new FileReader();
            reader.onload = async (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    await window.db.transaction('rw', window.db.tables, async () => {
                        for(let table of window.db.tables) {
                            if(data[table.name]) {
                                await table.clear();
                                await table.bulkAdd(data[table.name]);
                            }
                        }
                    });
                    alert("Data imported successfully! The page will now reload.");
                    window.location.reload();
                } catch(err) {
                    alert("Import failed: " + err.message);
                }
            };
            reader.readAsText(file);
        },
        resetData: async () => {
            if(confirm('Are you absolutely sure you want to delete ALL data? This action cannot be undone.')){
                await Promise.all(window.db.tables.map(t => t.clear()));
                alert("All data wiped. Page will reload.");
                window.location.reload();
            }
        }
    };

    document.getElementById('settings-form').addEventListener('submit', async(e) => {
        e.preventDefault();
        const data = {
            id: 'config',
            companyName: document.getElementById('set-company').value,
            address: document.getElementById('set-addr').value,
            phone: document.getElementById('set-phone').value,
            email: document.getElementById('set-email').value,
            gstNumber: document.getElementById('set-gst').value,
            bankDetails: document.getElementById('set-bank').value
        };
        await window.db.settings.put(data);
        alert('Settings saved!');
    });

    await window.SettingsApp.loadSettings();
});
