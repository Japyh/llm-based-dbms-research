// API Configuration
const API_URL = 'http://localhost:8000/api/v1';

// DOM Elements
const queryInput = document.getElementById('query-input');
const executeBtn = document.getElementById('execute-btn');
const resultsSection = document.getElementById('results-section');
const examplesToggle = document.getElementById('examples-toggle');
const examplesContent = document.getElementById('examples-content');
const copySqlBtn = document.getElementById('copy-sql-btn');
const chartTypeSelect = document.getElementById('chart-type-select');
const xAxisSelect = document.getElementById('x-axis-select');
const yAxisSelect = document.getElementById('y-axis-select');
const renderChartBtn = document.getElementById('render-chart-btn');
const chartCanvas = document.getElementById('chart-canvas');
const chartEmpty = document.getElementById('chart-empty');

let latestQueryResults = [];
let latestQueryText = '';
let activeChart = null;

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

        if (tabName === 'visualization' && latestQueryResults.length > 0) {
            renderChart();
        }
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
        displayResults(data, executionTime, query);
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
function displayResults(data, executionTime, queryText = '') {
    latestQueryResults = Array.isArray(data.results) ? data.results : [];
    latestQueryText = queryText || '';

    // Display data table
    if (latestQueryResults.length > 0) {
        const table = document.getElementById('results-table');
        const columns = Object.keys(latestQueryResults[0]);

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
        latestQueryResults.forEach(row => {
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
        document.getElementById('stat-rows').textContent = latestQueryResults.length;
        document.getElementById('stat-columns').textContent = columns.length;

        updateVisualizationControls(columns, latestQueryText);
    } else {
        document.getElementById('results-table').innerHTML = '<p class="no-results">No results found</p>';
        clearChart();
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

function detectChartTypeFromQuery(queryText = '') {
    const text = queryText.toLowerCase();

    if (text.includes('histogram') || text.includes('bar chart') || text.includes('bar graph')) {
        return 'bar';
    }
    if (text.includes('line chart') || text.includes('trend') || text.includes('over time') || text.includes('monthly') || text.includes('daily') || text.includes('yearly')) {
        return 'line';
    }
    if (text.includes('pie chart') || text.includes('share') || text.includes('distribution')) {
        return 'pie';
    }
    if (text.includes('doughnut')) {
        return 'doughnut';
    }
    if (text.includes('scatter')) {
        return 'scatter';
    }
    return 'bar';
}

function isNumericColumn(rows, column) {
    if (!rows.length) return false;
    return rows.every(row => {
        const value = row[column];
        return value !== null && value !== '' && !Number.isNaN(Number(value));
    });
}

function updateVisualizationControls(columns, queryText) {
    const numericColumns = columns.filter(col => isNumericColumn(latestQueryResults, col));
    const categoricalColumns = columns.filter(col => !numericColumns.includes(col));

    const preferredX = categoricalColumns[0] || columns[0];
    const preferredY = numericColumns[0] || columns[0];

    xAxisSelect.innerHTML = columns.map(col => `<option value="${col}">${col}</option>`).join('');
    yAxisSelect.innerHTML = columns.map(col => `<option value="${col}">${col}</option>`).join('');

    xAxisSelect.value = preferredX;
    yAxisSelect.value = preferredY;

    chartTypeSelect.value = 'auto';
    renderChart();
}

function clearChart(message = 'Run a query to generate a chart.') {
    if (activeChart) {
        activeChart.destroy();
        activeChart = null;
    }
    chartCanvas.style.display = 'none';
    chartEmpty.style.display = 'flex';
    chartEmpty.textContent = message;
}

function renderChart() {
    if (typeof Chart === 'undefined') {
        clearChart('Chart library could not be loaded.');
        return;
    }

    if (!latestQueryResults.length) {
        clearChart('No query results available for visualization.');
        return;
    }

    const selectedType = chartTypeSelect.value;
    const chartType = selectedType === 'auto' ? detectChartTypeFromQuery(latestQueryText) : selectedType;
    const xKey = xAxisSelect.value;
    const yKey = yAxisSelect.value;

    if (!xKey || !yKey) {
        clearChart('Please select X and Y axes.');
        return;
    }

    const labels = latestQueryResults.map(row => String(row[xKey]));
    const numericValues = latestQueryResults.map(row => Number(row[yKey]));
    const hasInvalidNumber = numericValues.some(value => Number.isNaN(value));

    if ((chartType !== 'pie' && chartType !== 'doughnut') && hasInvalidNumber) {
        clearChart(`Column "${yKey}" must be numeric for ${chartType} charts.`);
        return;
    }

    if (activeChart) {
        activeChart.destroy();
    }

    chartEmpty.style.display = 'none';
    chartCanvas.style.display = 'block';

    const palette = [
        '#2563EB', '#06B6D4', '#10B981', '#F59E0B', '#EF4444',
        '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#22C55E'
    ];
    const colors = latestQueryResults.map((_, idx) => palette[idx % palette.length]);

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#F1F5F9'
                }
            }
        }
    };

    let config;
    if (chartType === 'scatter') {
        const xNumericValues = latestQueryResults.map(row => Number(row[xKey]));
        if (xNumericValues.some(value => Number.isNaN(value)) || hasInvalidNumber) {
            clearChart('Scatter chart requires both X and Y axes to be numeric.');
            return;
        }

        config = {
            type: 'scatter',
            data: {
                datasets: [{
                    label: `${yKey} vs ${xKey}`,
                    data: latestQueryResults.map(row => ({ x: Number(row[xKey]), y: Number(row[yKey]) })),
                    backgroundColor: '#06B6D4'
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    x: {
                        ticks: { color: '#94A3B8' },
                        grid: { color: '#334155' }
                    },
                    y: {
                        ticks: { color: '#94A3B8' },
                        grid: { color: '#334155' }
                    }
                }
            }
        };
    } else {
        config = {
            type: chartType,
            data: {
                labels,
                datasets: [{
                    label: yKey,
                    data: numericValues,
                    backgroundColor: colors.map(c => `${c}CC`),
                    borderColor: colors,
                    borderWidth: 2,
                    fill: chartType === 'line'
                }]
            },
            options: {
                ...commonOptions,
                scales: (chartType === 'pie' || chartType === 'doughnut') ? undefined : {
                    x: {
                        ticks: { color: '#94A3B8' },
                        grid: { color: '#334155' }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#94A3B8' },
                        grid: { color: '#334155' }
                    }
                }
            }
        };
    }

    activeChart = new Chart(chartCanvas, config);
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

    displayResults(demoData, 450, queryInput.value.trim());
    resultsSection.style.display = 'block';
}

renderChartBtn.addEventListener('click', () => {
    renderChart();
});

[chartTypeSelect, xAxisSelect, yAxisSelect].forEach(control => {
    control.addEventListener('change', () => {
        renderChart();
    });
});

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
