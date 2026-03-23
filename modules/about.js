window.registerModule('about', async (container) => {
    container.innerHTML = `
        <div class="card" style="max-width: 600px; margin: 40px auto; text-align:center; padding: 48px 24px; box-shadow:var(--shadow);">
            <i data-lucide="bar-chart-2" style="width:80px; height:80px; color:var(--primary); margin-bottom:16px;"></i>
            <h2 style="font-size:2.5rem; margin-bottom:8px; font-weight:700; color:var(--text-main);">MarkeLedger</h2>
            <p style="color:var(--text-muted); margin-bottom:24px; font-weight:600; letter-spacing:1px; text-transform:uppercase;">Version 1.0.0</p>
            <p style="font-size:1.1rem; line-height:1.6; color:var(--text-main); margin-bottom:32px; padding:0 20px;">
                A comprehensive offline progressive web app designed specifically for Digital Marketing Finance & Agency Management. 
                Built to be fast, minimal, and fully functional without an internet connection.
            </p>
            <div style="background:#f8fafc; padding:24px; border-radius:8px; text-align:left; border:1px solid var(--border);">
                <h3 style="margin-bottom:16px; font-size:1.1rem; border-bottom:1px solid var(--border); padding-bottom:8px; color:var(--text-muted); text-transform:uppercase;">Creator Details</h3>
                <div style="display:flex; justify-content:space-between; margin-bottom:12px; align-items:center;">
                    <span style="color:var(--text-muted);"><i data-lucide="user" style="width:16px;height:16px;vertical-align:middle;"></i> Name:</span>
                    <strong style="color:var(--text-main); font-size:1.1rem;">Kiran Antony</strong>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:12px; align-items:center;">
                    <span style="color:var(--text-muted);"><i data-lucide="phone" style="width:16px;height:16px;vertical-align:middle;"></i> Contact:</span>
                    <strong style="color:var(--text-main); font-size:1.1rem; color:var(--primary);">7012633504 (WhatsApp)</strong>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--text-muted);"><i data-lucide="shield" style="width:16px;height:16px;vertical-align:middle;"></i> Visibility:</span>
                    <strong style="color:var(--success);">Only Inside App</strong>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
});
