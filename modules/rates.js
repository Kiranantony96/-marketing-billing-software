window.registerModule('rates', async (container) => {
    container.innerHTML = `
        <div class="card" style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2>Pricing Engine</h2>
                <button class="btn btn-primary" onclick="window.PricingApp.openModal()"><i data-lucide="plus"></i> Add Service</button>
            </div>
            <p style="margin-top:10px; color:var(--text-muted); font-size:0.9rem;">
                <b>Formula:</b> finalPrice = max(unitPrice * quantity, minCharge)
            </p>
        </div>
        <div id="services-list" class="grid-cards"></div>

        <!-- Add Service Modal -->
        <div id="service-modal" class="modal hidden">
            <div class="modal-content card" style="max-width: 500px; margin: 50px auto;">
                <h3 id="service-modal-title">Add Service</h3>
                <form id="service-form" style="display:flex; flex-direction:column; gap:16px; margin-top:16px;">
                    <input type="hidden" id="srv-id" />
                    <div>
                        <label>Service Name</label><br>
                        <input type="text" id="srv-name" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div>
                        <label>Pricing Model</label><br>
                        <select id="srv-type" onchange="window.PricingApp.toggleFields()" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                            <option value="unit">Unit/Quantity Based</option>
                            <option value="fixed">Fixed Price</option>
                            <option value="percent">Percentage Based</option>
                        </select>
                    </div>
                    <div id="field-unit">
                        <label>Unit Description (e.g. keywords, 500_words)</label><br>
                        <input type="text" id="srv-unit" placeholder="keyword" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div id="field-uprice">
                        <label>Cost / Unit (₹) or Fixed Price</label><br>
                        <input type="number" id="srv-uprice" value="0" min="0" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div id="field-minCharge">
                        <label>Minimum Charge (₹) [Overrides total if below]</label><br>
                        <input type="number" id="srv-min" value="0" min="0" required class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div id="field-percent" style="display:none;">
                        <label>Percentage (%)</label><br>
                        <input type="number" id="srv-perc" value="0" min="0" max="100" class="input-field" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        <button type="button" class="btn btn-secondary" onclick="window.PricingApp.closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    window.PricingApp = {
        toggleFields: () => {
            const t = document.getElementById('srv-type').value;
            document.getElementById('field-unit').style.display = t === 'unit' ? 'block' : 'none';
            document.getElementById('field-percent').style.display = t === 'percent' ? 'block' : 'none';
            document.getElementById('field-uprice').style.display = t === 'percent' ? 'none' : 'block';
        },
        openModal: (srv = null) => {
            document.getElementById('service-modal').classList.remove('hidden');
            document.getElementById('service-modal-title').innerText = srv ? 'Edit Service Base' : 'Add Service Base';
            document.getElementById('srv-id').value = srv ? srv.id : '';
            document.getElementById('srv-name').value = srv ? srv.name : '';
            
            let type = 'unit';
            if(srv) {
                if(srv.type === 'percentage' || srv.percent) type = 'percent';
                else if((srv.type === 'fixed') || (srv.defaultPrice && !srv.unit)) type = 'fixed';
            }
            document.getElementById('srv-type').value = type;
            
            document.getElementById('srv-unit').value = srv ? (srv.unit||'') : '';
            document.getElementById('srv-uprice').value = srv ? (srv.unitPrice || srv.defaultPrice || 0) : 0;
            document.getElementById('srv-min').value = srv ? (srv.minCharge || 0) : 0;
            document.getElementById('srv-perc').value = srv ? (srv.percent || 0) : 0;
            
            window.PricingApp.toggleFields();
        },
        closeModal: () => document.getElementById('service-modal').classList.add('hidden'),
        loadServices: async () => {
            const services = await window.db.services.toArray();
            const listDiv = document.getElementById('services-list');
            if(services.length === 0) {
                listDiv.innerHTML = `<div class="card" style="grid-column: 1/-1"><p class="text-muted">No services defined yet.</p></div>`;
                return;
            }
            listDiv.innerHTML = services.map(s => {
                let formula = '';
                if(s.type === 'percentage' || s.percent) formula = `${s.percent}%`;
                else if(s.type === 'fixed' || (s.defaultPrice && !s.unit)) formula = `Fixed: ₹${s.defaultPrice}`;
                else formula = `₹${s.unitPrice} / ${s.unit}`;

                return `
                <div class="card">
                    <div style="display:flex; justify-content:space-between;">
                        <h3 style="font-size:1.1rem;">${s.name}</h3>
                        <button class="btn-icon" onclick='window.PricingApp.edit(${JSON.stringify(s).replace(/'/g, "&#39;")})'><i data-lucide="settings"></i></button>
                    </div>
                    <div style="margin-top: 16px; font-size: 0.95rem; color:var(--text-main); background:#f1f5f9; padding:8px; border-radius:4px;">
                        <div><b>Basis:</b> <span style="color:var(--primary); font-weight:600;">${formula}</span></div>
                        <div style="margin-top:4px;"><b>Fixed Min. Charge:</b> ₹${s.minCharge || 0}</div>
                    </div>
                    ${s.addons ? `<div style="margin-top:12px; font-size:0.8rem; color:var(--text-muted);"><i data-lucide="plus-circle" style="width:12px;height:12px;"></i> ${s.addons.length} Add-ons available</div>` : ''}
                </div>
            `}).join('');
            lucide.createIcons();
        },
        edit: (s) => window.PricingApp.openModal(s)
    };

    document.getElementById('service-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('srv-id').value;
        const type = document.getElementById('srv-type').value;
        const uprice = Number(document.getElementById('srv-uprice').value);
        const minVal = Number(document.getElementById('srv-min').value);
        
        let data = {
            name: document.getElementById('srv-name').value,
            editable: true,
            minCharge: minVal
        };
        
        if(type === 'unit') {
            data.type = 'unit';
            data.unit = document.getElementById('srv-unit').value || 'unit';
            data.unitPrice = uprice;
            // validation logic
            if(data.unitPrice < 0 || minVal < 0) return alert("Validation Failed: No negative values allowed.");
        } else if(type === 'percent') {
            data.type = 'percentage';
            data.percent = Number(document.getElementById('srv-perc').value);
            if(data.percent < 0 || minVal < 0) return alert("Negative values not allowed");
        } else if(type === 'fixed') {
            data.type = 'fixed';
            data.defaultPrice = uprice;
            if(uprice < 0 || minVal < 0) return alert("Negative values not allowed");
        }

        if(id) await window.db.services.update(Number(id), data);
        else await window.db.services.add(data);
        
        window.PricingApp.closeModal();
        await window.PricingApp.loadServices();
    });

    await window.PricingApp.loadServices();
});
