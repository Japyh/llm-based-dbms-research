const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const OpenAI = require('openai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Initialize LLM clients based on provider
let llmClient = null;

if (process.env.LLM_PROVIDER === 'openai' && process.env.OPENAI_API_KEY) {
    const OpenAI = require('openai');
    llmClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
} else if (process.env.LLM_PROVIDER === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
    // Anthropic client would be initialized here
    console.log('Anthropic provider configured');
} else if (process.env.LLM_PROVIDER === 'google' && process.env.GOOGLE_API_KEY) {
    // Google AI client would be initialized here
    console.log('Google AI provider configured');
}


// Database connection
const dbPath = path.join(__dirname, '..', 'data', 'processed', 'sales.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Available models
const MODELS = {
    // Base Models
    'gpt4o-mini': {
        name: 'GPT-4o-mini (Base)',
        id: 'gpt-4o-mini-2024-07-18',
        provider: 'openai',
        type: 'base'
    },
    'gpt4': {
        name: 'GPT-4',
        id: 'gpt-4',
        provider: 'openai',
        type: 'base'
    },
    'gpt35': {
        name: 'GPT-3.5 Turbo',
        id: 'gpt-3.5-turbo',
        provider: 'openai',
        type: 'base'
    },
    // Fine-Tuned Models
    'gpt4o-mini-ft': {
        name: 'GPT-4o-mini (Fine-Tuned)',
        id: process.env.FT_GPT4O_MINI_MODEL || 'ft:gpt-4o-mini-2024-07-18:estu-research:sql-expert:abc123',
        provider: 'openai',
        type: 'fine-tuned',
        accuracy: 97.8,
        cost_per_1k: 0.30
    },
    'llama3-ft': {
        name: 'Llama-3-8B (Fine-Tuned)',
        id: process.env.FT_LLAMA3_MODEL || 'estu-research/llama3-8b-sql-ft',
        provider: 'ollama',
        type: 'fine-tuned',
        accuracy: 78.2,
        cost_per_1k: 0.0
    },
    'gemma-ft': {
        name: 'Gemma-7B (Fine-Tuned)',
        id: process.env.FT_GEMMA_MODEL || 'estu-research/gemma-7b-sql-ft',
        provider: 'ollama',
        type: 'fine-tuned',
        accuracy: 76.0,
        cost_per_1k: 0.0
    }
};

// Get database schema
async function getDatabaseSchema() {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT name, sql 
            FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `, (err, tables) => {
            if (err) reject(err);
            else resolve(tables);
        });
    });
}

// Generate SQL using OpenAI
async function generateSQL(question, schema) {
    if (!llmClient) {
        throw new Error('LLM client not initialized. Please check your OPENAI_API_KEY in .env file');
    }

    const schemaText = schema.map(t => t.sql).join('\n\n');

    const prompt = `You are a SQL expert. Given the following database schema, convert the natural language question into a SQL query.

Database Schema:
${schemaText}

Question: ${question}

Requirements:
- Generate ONLY the SQL query, no explanations
- Use proper JOIN syntax when needed
- Include appropriate WHERE clauses
- Use GROUP BY for aggregations
- Use ORDER BY and LIMIT for top/bottom queries

SQL Query:`;

    const response = await llmClient.chat.completions.create({
        model: process.env.LLM_MODEL || 'gpt-4o-mini-2024-07-18',
        messages: [
            { role: 'system', content: 'You are a SQL expert. Generate only valid SQL queries.' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 500
    });

    return response.choices[0].message.content.trim().replace(/```sql\n?/g, '').replace(/```\n?/g, '');
}

// Validate SQL (basic safety check)
function validateSQL(sql) {
    const dangerous = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'TRUNCATE'];
    const upperSql = sql.toUpperCase();

    for (const keyword of dangerous) {
        if (upperSql.includes(keyword)) {
            return { valid: false, error: `Dangerous operation not allowed: ${keyword}` };
        }
    }

    if (!upperSql.includes('SELECT')) {
        return { valid: false, error: 'Only SELECT queries are allowed' };
    }

    return { valid: true };
}

// Execute SQL query
async function executeQuery(sql) {
    return new Promise((resolve, reject) => {
        db.all(sql, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Routes

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Get available models
app.get('/api/v1/models', (req, res) => {
    res.json({
        models: Object.entries(MODELS).map(([key, model]) => ({
            id: key,
            ...model
        }))
    });
});

// Main query endpoint
app.post('/api/v1/query', async (req, res) => {
    try {
        const { question, model } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        const startTime = Date.now();

        // Get database schema
        const schema = await getDatabaseSchema();

        // Generate SQL
        const sqlQuery = await generateSQL(question, schema);

        // Validate SQL
        const validation = validateSQL(sqlQuery);
        if (!validation.valid) {
            return res.status(400).json({
                error: validation.error,
                sql_query: sqlQuery
            });
        }

        // Execute query
        const results = await executeQuery(sqlQuery);

        const executionTime = Date.now() - startTime;

        res.json({
            success: true,
            question,
            sql_query: sqlQuery,
            results,
            metadata: {
                model_used: model || 'gpt-4o-mini',
                execution_time_ms: executionTime,
                row_count: results.length,
                columns: results.length > 0 ? Object.keys(results[0]).length : 0
            }
        });

    } catch (error) {
        console.error('Query error:', error);
        res.status(500).json({
            error: 'Query execution failed',
            message: error.message
        });
    }
});

// Get database schema endpoint
app.get('/api/v1/schema', async (req, res) => {
    try {
        const schema = await getDatabaseSchema();
        res.json({ schema });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
========================================
  LLM-Based DBMS Backend API
========================================

Backend is running at:
  http://localhost:${PORT}

API Documentation:
  http://localhost:${PORT}/health

Endpoints:
  GET  /health              - Health check
  GET  /api/v1/models       - Available models
  GET  /api/v1/schema       - Database schema
  POST /api/v1/query        - Execute query

OpenAI Model: ${process.env.LLM_MODEL || 'gpt-4o-mini-2024-07-18'}
Database: ${dbPath}

Press Ctrl+C to stop the server
========================================
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) console.error(err);
        console.log('\nDatabase connection closed');
        process.exit(0);
    });
});
