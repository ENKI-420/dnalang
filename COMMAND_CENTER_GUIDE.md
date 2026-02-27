# DNALang Unified Command Center

**Natural Language Interface to All DNALang Features**

Access: **http://localhost:7777**

---

## What Is This?

A single, unified platform that lets you control all 29+ DNALang features using natural language. Instead of remembering exact command names, just describe what you want to do.

---

## Quick Start

```bash
# Launch the command center
./launch_command_center.sh

# Access in your browser
# http://localhost:7777
```

---

## How to Use

### Web Interface

1. **Open your browser** to http://localhost:7777
2. **Type naturally** in the command box:
   - "check quantum backends"
   - "start aura chat"
   - "launch the main portal"
   - "run nobel experiment"
3. **Hit Execute** or press Enter
4. **View results** in real-time output panel

### Quick Action Chips

Click any of the quick action buttons:
- **Check Backends** - Verify IBM Quantum connection
- **Start AURA** - Launch AURA chat interface
- **Main Portal** - Start web portal
- **Quick Proof** - Run quantum proof test
- **List Services** - See what's running

---

## Natural Language Examples

The system understands many variations:

### Starting Services

```
"start aura chat"
"launch aura"
"open aura interface"
"start the chat"
```

All execute: `./start_aura_chat.sh`

### Running Tests

```
"check quantum backends"
"test ibm quantum"
"verify quantum hardware"
"show available backends"
```

All execute: `python3 check_backends.py`

### Launching Web Apps

```
"launch portal"
"start main portal"
"open web portal"
"start frontend"
```

All execute: `cd project && pnpm dev`

### Running Experiments

```
"run nobel experiment"
"execute nobel"
"start nobel test"
```

All execute: `./run_nobel_experiment.sh`

---

## Command Categories

### ⚡ Quick Tests (< 2 min)

- `proof` - Quantum Loschmidt proof (60s)
- `chronos` - Blockchain status check
- `lambda` - Lambda optimization test
- `backends` - Check IBM Quantum hardware

### 🔬 Experiments

- `nobel` - 9-minute Nobel-tier pipeline
- `suite` - Comprehensive suite (2-4 hours)
- `evolution` - All quantum experiments
- `rzz` - Fractional RZZ evolution (18-24h)

### 🤖 AURA & Organisms

- `aura` - AURA Chat web interface (Port 8088)
- `compile` - Compile DNA organism code
- `chatbot` - Terminal-based chatbot
- `orchestrator` - Recursive self-improvement engine

### 🌐 Web Applications

- `portal` - Main Quantum Portal (Port 3000)
- `backend` - Unified Platform backend (9000-9002)
- `frontend` - Unified Platform frontend (Port 3001)
- `desktop` - DNALang Desktop (Electron)

### ⛓️ Blockchain

- `testnet` - Deploy to Base Sepolia
- `mainnet` - Deploy to Base mainnet
- `balance` - Check token balance

### 📊 Research Tools

- `vqe` - VQE optimization
- `android` - Test Android bridge
- `hamiltonian` - Construct fitness Hamiltonian
- `corpus` - Ingest quantum corpus

### ⚙️ Setup & Config

- `setup` - Setup IBM Quantum integration
- `credentials` - Configure API credentials

---

## Features

### 🎯 Natural Language Processing

The system intelligently parses your intent:

- **Action Detection**: start, launch, run, execute, stop, check, status
- **Category Detection**: quantum, web, blockchain, aura, organism
- **Pattern Matching**: Fuzzy matching on command descriptions
- **Smart Suggestions**: If unsure, suggests similar commands

### 📊 Real-time Dashboard

- **Service Monitor**: See all running services
- **Stats Display**: Commands executed, active services
- **Live Output**: Real-time command output
- **Command History**: Track what you've run

### 🚀 Service Management

- **Auto-tracking**: Detects when services start
- **Port Monitoring**: Shows which ports are in use
- **Status Updates**: Every 5 seconds
- **Background Execution**: Long-running commands handled gracefully

---

## API Endpoints

### GET /

Main dashboard UI

### GET /health

```json
{
  "status": "healthy",
  "timestamp": "2025-11-15T12:00:00"
}
```

### GET /commands

List all available commands

### GET /services

List currently running services

### POST /execute

Execute a natural language command

**Request:**
```json
{
  "command": "start aura chat"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Started: AURA Chat web interface",
  "command": "aura",
  "background": true
}
```

### GET /history

Get command execution history

---

## Advanced Usage

### Direct Command Names

If you know the exact command name, use it directly:

```
"aura"
"portal"
"backends"
"nobel"
```

### With Arguments (for supported commands)

Some commands support arguments:

```
"compile MyOrganism.dna"
```

### Intent-based Queries

Ask about capabilities:

```
"what can you do"
"help"
"list commands"
"show services"
```

---

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 7777
lsof -ti:7777

# Kill the process
kill -9 $(lsof -ti:7777)

# Restart
./launch_command_center.sh
```

### Dependencies Missing

```bash
# Install manually
pip3 install fastapi uvicorn[standard]
```

### Service Won't Start

Check the output panel for errors. Common issues:
- Missing credentials (QNET.json or .env.local)
- Port conflicts
- Missing dependencies in sub-projects

---

## Integration with Existing Tools

The Command Center wraps all existing scripts:

- `./QUICK_LAUNCH.sh` → Now accessible via web UI
- `./start_aura_chat.sh` → "start aura"
- `./run_nobel_experiment.sh` → "run nobel"
- All 29+ commands from quick launch menu

---

## Architecture

```
┌─────────────────────────────────────────────┐
│         Web Browser (Port 7777)             │
│  ┌───────────────────────────────────────┐  │
│  │     Natural Language Input            │  │
│  └───────────────────────────────────────┘  │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│       NLP Command Parser                    │
│  • Intent Detection                         │
│  • Pattern Matching                         │
│  • Command Resolution                       │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│       Command Executor                      │
│  • Script Execution                         │
│  • Service Tracking                         │
│  • Output Capture                           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│     Underlying DNALang Systems              │
│  • AURA Chat Server                         │
│  • Quantum Portal                           │
│  • Unified Platform                         │
│  • Blockchain Tools                         │
│  • Research Experiments                     │
└─────────────────────────────────────────────┘
```

---

## Benefits

✅ **Single Entry Point** - One platform for everything
✅ **No Memorization** - Natural language instead of exact syntax
✅ **Visual Dashboard** - See system status at a glance
✅ **Service Management** - Track what's running
✅ **Error Recovery** - Smart suggestions when commands fail
✅ **Documentation** - Built-in command reference

---

## Future Enhancements

Potential additions:
- WebSocket for real-time streaming output
- Multi-user support with authentication
- Command scheduling (cron-like)
- Saved command sets (workflows)
- Visual circuit designer integration
- AI-powered command prediction
- Voice input support

---

## Support

For issues or questions:
1. Check `/history` endpoint to review command execution
2. Verify services at `/services` endpoint
3. Check health at `/health` endpoint
4. Review logs in terminal where server is running

---

**Created**: 2025-11-15
**Version**: 1.0.0
**Author**: DNALang Command Center
