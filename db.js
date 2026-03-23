// Ensure Dexie is available
const db = new Dexie('MarkeLedgerDB');

db.version(1).stores({
    clients: '++id, name, email, phone, company, status',
    projects: '++id, title, clientId, status, deadline, budget',
    services: '++id, name, unit, unitPrice, minCharge, type, percent, editable',
    invoices: '++id, invoiceNumber, clientId, date, dueDate, subtotal, discount, gst, total, status',
    payments: '++id, invoiceId, amount, date, method',
    recurring: '++id, title, clientId, amount, nextBillingDate, type, status',
    staff: '++id, name, role, salaryType, baseSalary',
    tasks: '++id, title, assignedTo, deadline, status, payment',
    expenses: '++id, title, amount, date, category',
    settings: 'id, companyName, address, phone, email, gstNumber, logoUpload, bankDetails'
});

window.db = db;
