# Local Setup Guide

This guide will help you run the LLM-Based DBMS project on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (for version control)
- An **OpenAI API Key** (or other LLM provider key)

## Quick Start (5 Minutes)

### Step 1: Install Dependencies

Open PowerShell/Terminal in the project directory and run:

```powershell
# Install backend dependencies
cd backend_server
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables

1. Copy the example environment file:
```powershell
cd ..
Copy-Item .env.example .env
```

2. Edit the `.env` file and add your API keys:
```powershell
notepad .env
```

**Required settings:**
- `OPENAI_API_KEY` - Get from https://platform.openai.com/api-keys
- `LLM_PROVIDER=openai`
- `LLM_MODEL=gpt-4o-mini`

**Optional settings** (defaults are fine):
- `DATABASE_TYPE=sqlite`
- `API_PORT=8000`
- `FRONTEND_PORT=3000`

### Step 3: Initialize the Database

```powershell
cd backend_server
node init_db.js
```

This creates a SQLite database with sample sales data.

### Step 4: Start the Backend Server

```powershell
# In backend_server directory
node server.js
```

You should see:
```
✅ Backend server running on http://localhost:8000
✅ Database connected
✅ LLM client initialized (openai)
```

### Step 5: Start the Frontend (New Terminal)

Open a **new terminal/PowerShell window**:

```powershell
cd frontend
node server.js
```

You should see:
```
Frontend server running on http://localhost:3000
```

### Step 6: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs

## Testing Your Setup

### Test 1: Check API Health

```powershell
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "llm": "ready"
}
```

### Test 2: Try a Simple Query

Open http://localhost:3000 and type:
```
Show me all customers
```

Click "Execute Query" - you should see results!

## Troubleshooting

### Error: "Cannot find module"

**Solution**: Install dependencies
```powershell
cd backend_server
npm install
cd ../frontend
npm install
```

### Error: "OPENAI_API_KEY not set"

**Solution**: 
1. Make sure `.env` file exists in the root directory
2. Add your API key: `OPENAI_API_KEY=sk-...`
3. Restart the backend server

### Error: "Port already in use"

**Solution**: Change the port in `.env`:
```
API_PORT=8001
FRONTEND_PORT=3001
```

### Database Not Found

**Solution**: Initialize the database
```powershell
cd backend_server
node init_db.js
```

### LLM Queries Not Working

**Solutions**:
1. Verify your API key is correct
2. Check you have API credits/quota
3. Try a different model in `.env`:
   ```
   LLM_MODEL=gpt-3.5-turbo
   ```

## Project Structure

```
llm-based-dbms-research/
├── backend_server/          # Node.js backend API
│   ├── server.js           # Main API server
│   ├── package.json        # Backend dependencies
│   └── node_modules/       # Installed packages
├── frontend/               # Web interface
│   ├── index.html         # Main page
│   ├── app.js             # Frontend logic
│   ├── server.js          # Frontend server
│   └── package.json       # Frontend dependencies
├── data/                  # Database files
│   └── processed/
│       └── sales.db       # SQLite database
├── .env                   # Configuration (create from .env.example)
└── .env.example          # Example configuration
```

## Common Commands

### Start Everything
```powershell
# Terminal 1 - Backend
cd backend_server
node server.js

# Terminal 2 - Frontend
cd frontend
node server.js
```

### Stop Servers
Press `Ctrl+C` in each terminal

### View Logs
Backend and frontend output logs directly to the console

### Reset Database
```powershell
cd backend_server
Remove-Item ../data/processed/sales.db  # Delete old database
node init_db.js                          # Create new one
```

## Next Steps

1. **Try the Example Queries** in the frontend interface
2. **Explore the API** at http://localhost:8000/docs
3. **Read the Documentation** in `/docs` folder
4. **Run Experiments** using scripts in `/experiments`

## Development Mode

For auto-reload during development:

```powershell
# Backend with nodemon
cd backend_server
npm install -g nodemon
nodemon server.js

# Frontend (already has auto-reload)
cd frontend
node server.js
```

## Production Deployment

See [PRODUCTION_READY.md](PRODUCTION_READY.md) for deployment guides:
- Docker deployment
- Cloud hosting (Heroku, AWS, Azure)
- Security hardening
- Scaling considerations

## Support

If you encounter issues:
1. Check this guide's Troubleshooting section
2. Review [README.md](README.md) for project overview
3. Check [QUICKSTART.md](QUICKSTART.md) for usage examples
4. Open an issue on GitHub

## Environment Variables Reference

Key variables in `.env`:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes* | - | OpenAI API key |
| `LLM_PROVIDER` | Yes | openai | LLM provider (openai/anthropic/google) |
| `LLM_MODEL` | Yes | gpt-4o-mini | Model to use |
| `DATABASE_TYPE` | No | sqlite | Database type |
| `DATABASE_PATH` | No | ./data/processed/sales.db | SQLite DB path |
| `API_PORT` | No | 8000 | Backend port |
| `FRONTEND_PORT` | No | 3000 | Frontend port |
| `API_HOST` | No | localhost | API host |
| `DEBUG` | No | true | Enable debug mode |

*Required unless using mock LLM for testing

---

**Ready to start? Jump to [Quick Start](#quick-start-5-minutes)!**
