// Core App State

// Initialize Lucide Icons
lucide.createIcons();

// --- Routing and Navigation State ---
let currentPage = 'dashboard';

// A simple dictionary mapping module names to render functions
const modules = {};

// Register a module content renderer
window.registerModule = function(name, renderFn) {
    modules[name] = renderFn;
};

// Global functions for module use
window.renderPage = function(pageName) {
    currentPage = pageName;
    const contentDiv = document.getElementById('page-content');
    const pageTitle = document.getElementById('page-title');
    
    // Update active nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });

    // Format title
    const titleText = pageName.charAt(0).toUpperCase() + pageName.slice(1);
    pageTitle.textContent = titleText;

    // Call matched module
    if (modules[pageName]) {
        modules[pageName](contentDiv);
    } else {
        contentDiv.innerHTML = `
            <div class="card">
                <h2>${titleText} Page</h2>
                <p>This module is currently under construction.</p>
            </div>
        `;
    }
    
    // Re-initialize icons in newly injected content
    lucide.createIcons();
}

// Navigation Events
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.currentTarget.dataset.page;
        if(page === 'menu') {
            document.getElementById('mobile-menu').classList.remove('hidden');
            return;
        }
        document.getElementById('mobile-menu').classList.add('hidden');
        renderPage(page);
    });
});

// Seed Initial Data wrapper (example)
async function seedInitialServices() {
    const servicesCount = await db.services.count();
    if (servicesCount === 0) {
        await db.services.bulkAdd([
            { name: "SEO", unit: "keyword", unitPrice: 1000, minCharge: 6000, editable: true },
            { name: "Content Writing", unit: "500_words", unitPrice: 100, minCharge: 100, editable: true },
            { name: "Google Ads", type: "percentage", percent: 10, minCharge: 5000, editable: true },
            { name: "WordPress Static Website", defaultPrice: 25000, editable: true, addons: [
                { name: "Extra Page", price: 1000 },
                { name: "SEO Setup", price: 3000 },
                { name: "Speed Optimization", price: 2000 }
            ]}
        ]);
    }
}

// Default Dashboard rendering definition (placeholder until split into modules)
registerModule('dashboard', async (container) => {
    container.innerHTML = `
        <div class="dashboard-stats">
            <div class="stat-card">
                <div class="stat-card-title">Total Revenue</div>
                <div class="stat-card-value">₹0</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-title">Pending Invoices</div>
                <div class="stat-card-value">0</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-title">Active Projects</div>
                <div class="stat-card-value">0</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-title">Tasks Pending</div>
                <div class="stat-card-value">0</div>
            </div>
        </div>
        <div class="grid-cards">
            <div class="card">
                <h3>Recent Activities</h3>
                <p style="color: var(--text-muted); padding-top: 10px;">No recent activities...</p>
            </div>
            <div class="card">
                <h3>Quick Actions</h3>
                <div style="display:flex; gap:10px; padding-top:10px;">
                    <button class="btn btn-primary" onclick="alert('Feature coming')"><i data-lucide="plus"></i> New Invoice</button>
                    <button class="btn btn-secondary" onclick="alert('Feature coming')"><i data-lucide="users"></i> Add Client</button>
                </div>
            </div>
        </div>
    `;
});

// Init
window.addEventListener('DOMContentLoaded', async () => {
    await seedInitialServices();
    renderPage('dashboard');
});
