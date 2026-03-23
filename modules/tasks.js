window.registerModule('tasks', async (container) => {
    container.innerHTML = `
        <div class="card" style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2>Task Board</h2>
                <button class="btn btn-primary" onclick="window.TasksApp.openModal()"><i data-lucide="plus"></i> Add Task</button>
            </div>
        </div>
        <div id="tasks-list" class="grid-cards"></div>

        <div id="task-modal" class="modal hidden">
            <div class="modal-content card" style="max-width: 500px; margin: 50px auto;">
                <h3 id="task-modal-title">Task Details</h3>
                <form id="task-form" style="display:flex; flex-direction:column; gap:16px; margin-top:16px;">
                    <input type="hidden" id="tsk-id" />
                    <div>
                        <label>Task Title</label><br>
                        <input type="text" id="tsk-title" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div>
                        <label>Assign To (Staff)</label><br>
                        <select id="tsk-staff" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;"></select>
                    </div>
                    <div style="display:flex; gap:16px;">
                        <div style="flex:1">
                            <label>Status</label><br>
                            <select id="tsk-status" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                        <div style="flex:1">
                            <label>Deadline</label><br>
                            <input type="date" id="tsk-date" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                        </div>
                    </div>
                    <div>
                        <label>Task Payment / Commission (₹)</label><br>
                        <input type="number" id="tsk-pay" min="0" value="0" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    
                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        <button type="button" class="btn btn-secondary" onclick="window.TasksApp.closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Task</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    window.TasksApp = {
        openModal: async (tsk = null) => {
            document.getElementById('task-modal').classList.remove('hidden');
            document.getElementById('task-modal-title').innerText = tsk ? 'Edit Task' : 'New Task';
            
            document.getElementById('tsk-id').value = tsk ? tsk.id : '';
            document.getElementById('tsk-title').value = tsk ? tsk.title : '';
            document.getElementById('tsk-status').value = tsk ? tsk.status : 'pending';
            document.getElementById('tsk-pay').value = tsk ? tsk.payment : 0;
            
            if(tsk && tsk.deadline) {
                document.getElementById('tsk-date').value = tsk.deadline;
            } else {
                document.getElementById('tsk-date').value = new Date().toISOString().split('T')[0];
            }

            const staffList = await window.db.staff.toArray();
            const staffSelect = document.getElementById('tsk-staff');
            if(staffList.length === 0){
                staffSelect.innerHTML = `<option value="">-- No staff members --</option>`;
            } else {
                staffSelect.innerHTML = `<option value="">-- Unassigned --</option>` + staffList.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
                if(tsk && tsk.assignedTo) staffSelect.value = tsk.assignedTo;
            }
        },
        closeModal: () => document.getElementById('task-modal').classList.add('hidden'),
        loadTasks: async () => {
            const list = await window.db.tasks.toArray();
            const staffList = await window.db.staff.toArray();
            const sMap = {}; staffList.forEach(s => sMap[s.id] = s.name);

            const container = document.getElementById('tasks-list');
            if(list.length === 0){
                container.innerHTML = `<div class="card" style="grid-column: 1/-1"><p class="text-muted">No tasks available.</p></div>`;
                return;
            }
            
            // Sort: pending first, then in-progress, then done
            const statusOrder = {'pending': 1, 'in-progress': 2, 'done': 3};
            list.sort((a,b) => statusOrder[a.status] - statusOrder[b.status]);

            container.innerHTML = list.map(t => {
                let sColor = t.status === 'done' ? 'var(--success)' : (t.status === 'in-progress' ? 'var(--primary)' : 'var(--warning)');
                return `
                <div class="card" style="border-left: 4px solid ${sColor};">
                    <div style="display:flex; justify-content:space-between;">
                        <h3 style="font-size:1.1rem; flex:1; text-decoration: ${t.status === 'done' ? 'line-through': 'none'}">${t.title}</h3>
                        <button class="btn-icon" onclick='window.TasksApp.edit(${JSON.stringify(t).replace(/'/g, "&#39;")})'><i data-lucide="edit"></i></button>
                    </div>
                    <div style="margin-top:12px; font-size:0.85rem; color:var(--text-muted); display:flex; flex-direction:column; gap:6px;">
                        <div style="display:flex; align-items:center; justify-content:space-between;">
                            <span><i data-lucide="user" style="width:14px;height:14px;vertical-align:middle;"></i> Assignee:</span>
                            <span style="font-weight:600; color:var(--text-main);">${t.assignedTo ? (sMap[t.assignedTo] || 'Unknown') : 'Unassigned'}</span>
                        </div>
                        <div style="display:flex; align-items:center; justify-content:space-between;">
                            <span><i data-lucide="calendar" style="width:14px;height:14px;vertical-align:middle;"></i> Deadline:</span>
                            <span style="${t.status !== 'done' ? 'color:var(--danger);font-weight:600;' : ''}">${t.deadline}</span>
                        </div>
                        <div style="display:flex; align-items:center; justify-content:space-between; border-top:1px dashed var(--border); padding-top:6px; margin-top:6px;">
                            <span>Task Payout:</span>
                            <span style="font-weight:600; color:var(--text-main);">₹${t.payment}</span>
                        </div>
                    </div>
                    <div style="margin-top:12px; text-align:right;">
                        <span style="background:#f1f5f9; padding:4px 8px; border-radius:4px; font-size:0.7rem; text-transform:uppercase; font-weight:700; letter-spacing:0.5px; color:${sColor}">${t.status}</span>
                    </div>
                </div>
            `}).join('');
            lucide.createIcons();
        },
        edit: (t) => window.TasksApp.openModal(t)
    };

    document.getElementById('task-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('tsk-id').value;
        const data = {
            title: document.getElementById('tsk-title').value,
            assignedTo: Number(document.getElementById('tsk-staff').value) || null,
            status: document.getElementById('tsk-status').value,
            deadline: document.getElementById('tsk-date').value,
            payment: Number(document.getElementById('tsk-pay').value)
        };

        if(id) await window.db.tasks.update(Number(id), data);
        else await window.db.tasks.add(data);

        window.TasksApp.closeModal();
        await window.TasksApp.loadTasks();
    });

    await window.TasksApp.loadTasks();
});
