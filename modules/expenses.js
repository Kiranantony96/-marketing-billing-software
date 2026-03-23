window.registerModule('expenses', async (container) => {
    container.innerHTML = `
        <div class="card" style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2>Expenses</h2>
                <button class="btn btn-primary" onclick="window.ExpensesApp.openModal()"><i data-lucide="plus"></i> Add Expense</button>
            </div>
        </div>
        <div id="expenses-list" class="grid-cards"></div>

        <div id="expense-modal" class="modal hidden">
            <div class="modal-content card" style="max-width: 500px; margin: 50px auto;">
                <h3 id="expense-modal-title">Record Expense</h3>
                <form id="expense-form" style="display:flex; flex-direction:column; gap:16px; margin-top:16px;">
                    <input type="hidden" id="exp-id" />
                    <div>
                        <label>Title / Description</label><br>
                        <input type="text" id="exp-title" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div>
                        <label>Amount (₹)</label><br>
                        <input type="number" id="exp-amount" required min="0" step="any" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div>
                        <label>Category</label><br>
                        <select id="exp-category" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                            <option value="tools">Tools/Software</option>
                            <option value="salary">Salary</option>
                            <option value="ads">Ads</option>
                            <option value="misc">Miscellaneous</option>
                        </select>
                    </div>
                    <div>
                        <label>Date</label><br>
                        <input type="date" id="exp-date" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    
                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        <button type="button" class="btn btn-secondary" onclick="window.ExpensesApp.closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Expense</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    window.ExpensesApp = {
        openModal: (exp = null) => {
            document.getElementById('expense-modal').classList.remove('hidden');
            document.getElementById('expense-modal-title').innerText = exp ? 'Edit Expense' : 'Record Expense';
            
            document.getElementById('exp-id').value = exp ? exp.id : '';
            document.getElementById('exp-title').value = exp ? exp.title : '';
            document.getElementById('exp-amount').value = exp ? exp.amount : '';
            document.getElementById('exp-category').value = exp ? exp.category : 'misc';
            
            if(exp && exp.date) {
                document.getElementById('exp-date').value = exp.date;
            } else {
                document.getElementById('exp-date').value = new Date().toISOString().split('T')[0];
            }
        },
        closeModal: () => document.getElementById('expense-modal').classList.add('hidden'),
        loadExpenses: async () => {
            const list = await window.db.expenses.toArray();
            const container = document.getElementById('expenses-list');
            if(list.length === 0){
                container.innerHTML = `<div class="card" style="grid-column: 1/-1"><p class="text-muted">No expenses recorded yet.</p></div>`;
                return;
            }
            list.reverse();
            container.innerHTML = list.map(e => `
                <div class="card">
                    <div style="display:flex; justify-content:space-between;">
                        <h3 style="font-size:1.1rem;">${e.title}</h3>
                        <button class="btn-icon" onclick='window.ExpensesApp.edit(${JSON.stringify(e).replace(/'/g, "&#39;")})'><i data-lucide="edit"></i></button>
                    </div>
                    <div style="margin-top:12px; font-size:0.9rem; display:flex; justify-content:space-between; align-items:flex-end;">
                        <div>
                            <span style="font-weight:700; font-size:1.2rem; color:var(--danger)">₹${e.amount}</span>
                            <div style="color:var(--text-muted); font-size:0.8rem; margin-top:6px;"><i data-lucide="calendar" style="width:12px;height:12px;vertical-align:middle;"></i> ${e.date}</div>
                        </div>
                        <span style="background:#f1f5f9; padding:4px 8px; border-radius:4px; font-size:0.75rem; text-transform:uppercase; border:1px solid var(--border);">${e.category}</span>
                    </div>
                </div>
            `).join('');
            lucide.createIcons();
        },
        edit: (exp) => window.ExpensesApp.openModal(exp)
    };

    document.getElementById('expense-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('exp-id').value;
        const data = {
            title: document.getElementById('exp-title').value,
            amount: Number(document.getElementById('exp-amount').value),
            category: document.getElementById('exp-category').value,
            date: document.getElementById('exp-date').value
        };

        if(id) await window.db.expenses.update(Number(id), data);
        else await window.db.expenses.add(data);

        window.ExpensesApp.closeModal();
        await window.ExpensesApp.loadExpenses();
    });

    await window.ExpensesApp.loadExpenses();
});
