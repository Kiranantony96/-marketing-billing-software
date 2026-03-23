window.registerModule('projects', async (container) => {
    container.innerHTML = `
        <div class="card" style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2>Projects Management</h2>
                <button class="btn btn-primary" onclick="window.ProjectsApp.openModal()"><i data-lucide="plus"></i> New Project</button>
            </div>
        </div>
        <div id="projects-list" class="grid-cards"></div>

        <!-- Add Project Modal -->
        <div id="project-modal" class="modal hidden">
            <div class="modal-content card" style="max-width: 500px; margin: 50px auto;">
                <h3 id="project-modal-title">Add New Project</h3>
                <form id="project-form" style="display:flex; flex-direction:column; gap:16px; margin-top:16px;">
                    <input type="hidden" id="project-id" />
                    <div>
                        <label>Title</label><br>
                        <input type="text" id="project-title" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div>
                        <label>Client</label><br>
                        <select id="project-client" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;"></select>
                    </div>
                    <div>
                        <label>Status</label><br>
                        <select id="project-status" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                        </select>
                    </div>
                    <div>
                        <label>Deadline</label><br>
                        <input type="date" id="project-deadline" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div>
                        <label>Budget (₹)</label><br>
                        <input type="number" id="project-budget" min="0" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        <button type="button" class="btn btn-secondary" onclick="window.ProjectsApp.closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    window.ProjectsApp = {
        openModal: async (project = null) => {
            document.getElementById('project-modal').classList.remove('hidden');
            document.getElementById('project-modal-title').innerText = project ? 'Edit Project' : 'Add New Project';
            document.getElementById('project-id').value = project ? project.id : '';
            document.getElementById('project-title').value = project ? project.title : '';
            document.getElementById('project-status').value = project ? project.status : 'pending';
            document.getElementById('project-deadline').value = project ? project.deadline : '';
            document.getElementById('project-budget').value = project ? project.budget : '';

            // Load clients into dropdown
            const clients = await window.db.clients.toArray();
            const clientSelect = document.getElementById('project-client');
            if(clients.length === 0) {
                clientSelect.innerHTML = `<option value="">-- No clients (Please add a client first) --</option>`;
            } else {
                clientSelect.innerHTML = clients.map(c => `<option value="${c.id}">${c.name} (${c.company||'No Company'})</option>`).join('');
                if(project && project.clientId) clientSelect.value = project.clientId;
            }
        },
        closeModal: () => {
            document.getElementById('project-modal').classList.add('hidden');
        },
        loadProjects: async () => {
            const projects = await window.db.projects.toArray();
            const listDiv = document.getElementById('projects-list');
            
            if(projects.length === 0){
                listDiv.innerHTML = `<div class="card" style="grid-column: 1 / -1;"><p class="text-muted">No projects found. Create one.</p></div>`;
                return;
            }
            
            const clients = await window.db.clients.toArray();
            const clientMap = {};
            clients.forEach(c => clientMap[c.id] = c.name);

            listDiv.innerHTML = projects.map(p => `
                <div class="card">
                    <div style="display:flex; justify-content:space-between;">
                        <h3 style="font-size:1.1rem; flex:1;">${p.title}</h3>
                        <button class="btn-icon" onclick='window.ProjectsApp.edit(${JSON.stringify(p).replace(/'/g, "&#39;")})'><i data-lucide="edit"></i></button>
                    </div>
                    <p style="color:var(--primary); font-size:0.875rem; font-weight:600; margin-top:4px;">${clientMap[p.clientId] || 'Unknown Client'}</p>
                    <div style="margin-top: 16px; font-size: 0.875rem; display:flex; justify-content:space-between; align-items:flex-end;">
                        <div>
                            <span style="background:#f1f5f9; padding:4px 8px; border-radius:4px; text-transform:capitalize; border:1px solid var(--border);">${p.status}</span>
                            <div style="color:var(--danger); margin-top:8px;"><i data-lucide="calendar" style="width:14px;height:14px;vertical-align:middle;"></i> ${p.deadline || 'No deadline'}</div>
                        </div>
                        <div style="font-weight:700; color:var(--text-main); font-size:1.1rem;">
                            ₹${p.budget || 0}
                        </div>
                    </div>
                </div>
            `).join('');
            lucide.createIcons();
        },
        edit: (p) => window.ProjectsApp.openModal(p)
    };

    document.getElementById('project-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const clientVal = document.getElementById('project-client').value;
        if(!clientVal) {
            alert("Please add a client first.");
            return;
        }

        const id = document.getElementById('project-id').value;
        const data = {
            title: document.getElementById('project-title').value,
            clientId: Number(clientVal),
            status: document.getElementById('project-status').value,
            deadline: document.getElementById('project-deadline').value,
            budget: Number(document.getElementById('project-budget').value)
        };

        if(id) await window.db.projects.update(Number(id), data);
        else await window.db.projects.add(data);
        
        window.ProjectsApp.closeModal();
        await window.ProjectsApp.loadProjects();
    });

    await window.ProjectsApp.loadProjects();
});
