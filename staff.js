window.registerModule('staff', async (container) => {
    container.innerHTML = `
        <div class="card" style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2>Staff & Team</h2>
                <button class="btn btn-primary" onclick="window.StaffApp.openModal()"><i data-lucide="plus"></i> Add Staff</button>
            </div>
        </div>
        <div id="staff-list" class="grid-cards"></div>

        <div id="staff-modal" class="modal hidden">
            <div class="modal-content card" style="max-width: 500px; margin: 50px auto;">
                <h3 id="staff-modal-title">Add Staff</h3>
                <form id="staff-form" style="display:flex; flex-direction:column; gap:16px; margin-top:16px;">
                    <input type="hidden" id="stf-id" />
                    <div>
                        <label>Name</label><br>
                        <input type="text" id="stf-name" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div>
                        <label>Role</label><br>
                        <input type="text" id="stf-role" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div>
                        <label>Salary Type</label><br>
                        <select id="stf-type" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                            <option value="fixed">Fixed Monthly</option>
                            <option value="per-day">Per Day</option>
                            <option value="per-project">Per Project</option>
                        </select>
                    </div>
                    <div>
                        <label>Base Salary / Rate (₹)</label><br>
                        <input type="number" id="stf-salary" required min="0" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    
                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        <button type="button" class="btn btn-secondary" onclick="window.StaffApp.closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    window.StaffApp = {
        openModal: (stf = null) => {
            document.getElementById('staff-modal').classList.remove('hidden');
            document.getElementById('staff-modal-title').innerText = stf ? 'Edit Staff' : 'Add Staff';
            document.getElementById('stf-id').value = stf ? stf.id : '';
            document.getElementById('stf-name').value = stf ? stf.name : '';
            document.getElementById('stf-role').value = stf ? stf.role : '';
            document.getElementById('stf-type').value = stf ? stf.salaryType : 'fixed';
            document.getElementById('stf-salary').value = stf ? stf.baseSalary : '';
        },
        closeModal: () => document.getElementById('staff-modal').classList.add('hidden'),
        loadStaff: async () => {
            const list = await window.db.staff.toArray();
            const container = document.getElementById('staff-list');
            if(list.length === 0){
                container.innerHTML = `<div class="card" style="grid-column: 1/-1"><p class="text-muted">No staff added.</p></div>`;
                return;
            }
            container.innerHTML = list.map(s => `
                <div class="card">
                    <div style="display:flex; justify-content:space-between;">
                        <div style="display:flex; gap:12px; align-items:center;">
                            <div class="user-avatar" style="width:40px; height:40px;">${s.name.substring(0,2).toUpperCase()}</div>
                            <div>
                                <h3 style="font-size:1.1rem; line-height:1;">${s.name}</h3>
                                <div style="color:var(--text-muted); font-size:0.85rem; margin-top:4px;">${s.role}</div>
                            </div>
                        </div>
                        <button class="btn-icon" onclick='window.StaffApp.edit(${JSON.stringify(s).replace(/'/g, "&#39;")})'><i data-lucide="edit"></i></button>
                    </div>
                    <div style="margin-top:20px; font-size:0.9rem; border-top:1px dashed var(--border); padding-top:12px; display:flex; justify-content:space-between; align-items:baseline;">
                        <div><span style="color:var(--text-muted); font-size:0.8rem;">Rate:</span> <span style="font-weight:700; font-size:1.1rem; color:var(--text-main);">₹${s.baseSalary}</span></div>
                        <span style="text-transform:capitalize; background:#f1f5f9; padding:2px 8px; border-radius:4px; font-size:0.75rem;">${s.salaryType}</span>
                    </div>
                </div>
            `).join('');
            lucide.createIcons();
        },
        edit: (s) => window.StaffApp.openModal(s)
    };

    document.getElementById('staff-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('stf-id').value;
        const data = {
            name: document.getElementById('stf-name').value,
            role: document.getElementById('stf-role').value,
            salaryType: document.getElementById('stf-type').value,
            baseSalary: Number(document.getElementById('stf-salary').value)
        };

        if(id) await window.db.staff.update(Number(id), data);
        else await window.db.staff.add(data);

        window.StaffApp.closeModal();
        await window.StaffApp.loadStaff();
    });

    await window.StaffApp.loadStaff();
});
