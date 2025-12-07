// API Configuration
const API_URL = 'http://localhost:8000/api/v1';

// DOM Elements
const queryInput = document.getElementById('query-input');
const executeBtn = document.getElementById('execute-btn');
const resultsSection = document.getElementById('results-section');
const examplesToggle = document.getElementById('examples-toggle');
const examplesContent = document.getElementById('examples-content');
const copySqlBtn = document.getElementById('copy-sql-btn');

// Tab Management
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');

        // Remove active class from all tabs
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        // Add active class to clicked tab
        btn.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    });
});

// Examples Toggle
examplesToggle.addEventListener('click', () => {
    examplesToggle.classList.toggle('active');
    examplesContent.classList.toggle('show');
});

// Quick Query Buttons
const quickQueryBtns = document.querySelectorAll('.quick-query-btn');
quickQueryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const queries = {
            'Top Customers': 'List the top 5 customers by total sales',
            'Revenue by Country': 'What is the total revenue by country?',
            'Product Sales': 'Show products and their total sales revenue'
        };
        queryInput.value = queries[btn.textContent];
    });
});

// Execute Query
executeBtn.addEventListener('click', async () => {
    const query = queryInput.value.trim();

    if (!query) {
        showNotification('Please enter a query', 'warning');
        return;
    }

    executeBtn.disabled = true;
    executeBtn.innerHTML = `
        <svg class="animate-spin" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clip-rule="evenodd" opacity="0.3"/>
            <path d="M10 2a8 8 0 017.391 5h-2.09A6 6 0 0010 4V2z"/>
        </svg>
        Processing...
    `;

    try {
        const startTime = Date.now();

        // Make API request
        const response = await fetch(`${API_URL}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: query })
        });

        const endTime = Date.now();
        const executionTime = endTime - startTime;

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Display results
        displayResults(data, executionTime);
        resultsSection.style.display = 'block';

        showNotification('Query executed successfully', 'success');

    } catch (error) {
        console.error('Error:', error);
        showNotification('Error executing query. Make sure backend is running.', 'error');
        displayDemoResults(); // Show demo results if backend is unavailable
    } finally {
        executeBtn.disabled = false;
        executeBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
            </svg>
            Execute Query
        `;
    }
});

// Display Results
function displayResults(data, executionTime) {
    // Display data table
    if (data.results && data.results.length > 0) {
        const table = document.getElementById('results-table');
        const columns = Object.keys(data.results[0]);

        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // Create table body
        const tbody = document.createElement('tbody');
        data.results.forEach(row => {
            const tr = document.createElement('tr');
            columns.forEach(col => {
                const td = document.createElement('td');
                td.textContent = row[col];
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        table.innerHTML = '';
        table.appendChild(thead);
        table.appendChild(tbody);

        // Update stats
        document.getElementById('stat-rows').textContent = data.results.length;
        document.getElementById('stat-columns').textContent = columns.length;
    } else {
        document.getElementById('results-table').innerHTML = '<p class="no-results">No results found</p>';
    }

    document.getElementById('stat-time').textContent = `${executionTime}ms`;

    // Display SQL
    const sqlCode = document.getElementById('sql-code');
    sqlCode.textContent = data.sql_query || 'No SQL generated';

    // Update metadata
    document.getElementById('meta-model').textContent = document.getElementById('model-select').selectedOptions[0].text;
    document.getElementById('meta-time').textContent = `${executionTime}ms`;
    document.getElementById('meta-tokens').textContent = '~150';
}

// Demo Results (when backend is unavailable)
function displayDemoResults() {
    const demoData = {
        results: [
            { customer: 'ACME Corp', country: 'France', total_sales: 125000 },
            { customer: 'TechStart', country: 'France', total_sales: 98000 },
            { customer: 'Global Ltd', country: 'France', total_sales: 87500 },
            { customer: 'DataCo', country: 'France', total_sales: 76000 },
            { customer: 'CloudSys', country: 'France', total_sales: 65000 }
        ],
        sql_query: `SELECT 
    c.customerName as customer,
    c.country,
    SUM(od.quantityOrdered * od.priceEach) as total_sales
FROM customers c
JOIN orders o ON c.customerNumber = o.customerNumber
JOIN orderDetails od ON o.orderNumber = od.orderNumber
WHERE c.country = 'France'
GROUP BY c.customerNumber, c.customerName, c.country
ORDER BY total_sales DESC
LIMIT 5;`
    };

    displayResults(demoData, 450);
    resultsSection.style.display = 'block';
}

// Copy SQL to Clipboard
copySqlBtn.addEventListener('click', () => {
    const sqlCode = document.getElementById('sql-code').textContent;
    navigator.clipboard.writeText(sqlCode).then(() => {
        showNotification('SQL copied to clipboard', 'success');
    });
});

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#F59E0B'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .animate-spin {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .no-results {
        padding: 2rem;
        text-align: center;
        color: var(--text-muted);
    }
`;
document.head.appendChild(style);

// Initialize
console.log('LLM-Based DBMS Frontend Initialized');
console.log('Backend URL:', API_URL);
