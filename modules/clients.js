window.registerModule('clients', async (container) => {
    container.innerHTML = `
        <div class="card" style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2>Clients Directory</h2>
                <button class="btn btn-primary" onclick="window.ClientsApp.openModal()"><i data-lucide="user-plus"></i> Add Client</button>
            </div>
        </div>
        <div id="clients-list" class="grid-cards"></div>

        <!-- Add Client Modal (Hidden) -->
        <div id="client-modal" class="modal hidden">
            <div class="modal-content card" style="max-width: 500px; margin: 50px auto;">
                <h3 id="modal-title">Add New Client</h3>
                <form id="client-form" style="display:flex; flex-direction:column; gap:16px; margin-top:16px;">
                    <input type="hidden" id="client-id" />
                    <div>
                        <label>Name</label><br>
                        <input type="text" id="client-name" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div>
                        <label>Company</label><br>
                        <input type="text" id="client-company" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div>
                        <label>Email</label><br>
                        <input type="email" id="client-email" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div>
                        <label>Phone</label><br>
                        <input type="tel" id="client-phone" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        <button type="button" class="btn btn-secondary" onclick="window.ClientsApp.closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>
        
        <style>
            .modal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 100; }
            .hidden { display: none !important; }
        </style>
    `;

    // Internal App Logic for Clients
    window.ClientsApp = {
        openModal: (client = null) => {
            document.getElementById('client-modal').classList.remove('hidden');
            document.getElementById('modal-title').innerText = client ? 'Edit Client' : 'Add New Client';
            document.getElementById('client-id').value = client ? client.id : '';
            document.getElementById('client-name').value = client ? client.name : '';
            document.getElementById('client-company').value = client ? client.company : '';
            document.getElementById('client-email').value = client ? client.email : '';
            document.getElementById('client-phone').value = client ? client.phone : '';
        },
        closeModal: () => {
            document.getElementById('client-modal').classList.add('hidden');
        },
        loadClients: async () => {
            const clients = await window.db.clients.toArray();
            const listDiv = document.getElementById('clients-list');
            if(clients.length === 0){
                listDiv.innerHTML = `<div class="card" style="grid-column: 1 / -1;"><p class="text-muted">No clients yet. Add one to get started.</p></div>`;
                return;
            }
            listDiv.innerHTML = clients.map(client => `
                <div class="card">
                    <div style="display:flex; justify-content:space-between;">
                        <h3>${client.name}</h3>
                        <button class="btn-icon" onclick='window.ClientsApp.edit(${JSON.stringify(client).replace(/'/g, "&#39;")})'><i data-lucide="edit"></i></button>
                    </div>
                    <p style="color:var(--text-muted); font-size:0.875rem;">${client.company || 'No Company'}</p>
                    <div style="margin-top: 16px; display:flex; flex-direction:column; gap:8px;">
                        <div style="display:flex; align-items:center; gap:8px; font-size:0.875rem;">
                            <i data-lucide="mail"></i> ${client.email}
                        </div>
                        <div style="display:flex; align-items:center; gap:8px; font-size:0.875rem;">
                            <i data-lucide="phone"></i> ${client.phone}
                        </div>
                    </div>
                </div>
            `).join('');
            lucide.createIcons();
        },
        edit: (client) => {
            window.ClientsApp.openModal(client);
        }
    };

    // Form Submit
    document.getElementById('client-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('client-id').value;
        const data = {
            name: document.getElementById('client-name').value,
            company: document.getElementById('client-company').value,
            email: document.getElementById('client-email').value,
            phone: document.getElementById('client-phone').value,
            status: 'active'
        };

        if(id) {
            await window.db.clients.update(Number(id), data);
        } else {
            await window.db.clients.add(data);
        }
        
        window.ClientsApp.closeModal();
        await window.ClientsApp.loadClients();
    });

    await window.ClientsApp.loadClients();
});
