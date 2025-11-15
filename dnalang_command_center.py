#!/usr/bin/env python3
"""
DNALang Unified Command Center
Natural Language Processing Interface for All DNALang Features

Usage:
    python3 dnalang_command_center.py
    Access: http://localhost:7777
"""

import asyncio
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any

try:
    from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import HTMLResponse, JSONResponse
    from fastapi.staticfiles import StaticFiles
    import uvicorn
except ImportError:
    print("Installing required dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "fastapi", "uvicorn[standard]", "websockets"])
    from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import HTMLResponse, JSONResponse
    import uvicorn

app = FastAPI(title="DNALang Unified Command Center", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
running_services = {}
command_history = []

# Define all available commands with NLP patterns
COMMAND_DATABASE = {
    # QUICK TESTS (< 2 min)
    "proof": {
        "script": "./run_quantum_loschmidt_proof.sh",
        "description": "Run quantum Loschmidt proof (60 sec)",
        "category": "quick_test",
        "patterns": ["proof", "loschmidt", "quick test"],
        "duration": "60s"
    },
    "chronos": {
        "script": "./check_chronos_status.sh",
        "description": "Check Chronos Quantum blockchain status",
        "category": "quick_test",
        "patterns": ["chronos", "blockchain status", "check blockchain"],
        "duration": "30s"
    },
    "lambda": {
        "script": "cd LambdaMaximizer && python3 optimizer.py --quick",
        "description": "Quick Lambda optimization test",
        "category": "quick_test",
        "patterns": ["lambda", "optimize", "quick optimize"],
        "duration": "90s"
    },
    "backends": {
        "script": "python3 check_backends.py",
        "description": "Check available IBM Quantum backends",
        "category": "quick_test",
        "patterns": ["backends", "check backends", "ibm quantum", "quantum hardware"],
        "duration": "30s"
    },

    # EXPERIMENTS (2 min - 24 hours)
    "nobel": {
        "script": "./run_nobel_experiment.sh",
        "description": "9-minute Nobel-tier experiment pipeline",
        "category": "experiment",
        "patterns": ["nobel", "nobel experiment", "full experiment"],
        "duration": "9m"
    },
    "suite": {
        "script": "./run_comprehensive_suite.sh",
        "description": "Comprehensive data collection suite (2-4 hours)",
        "category": "experiment",
        "patterns": ["suite", "comprehensive", "full suite"],
        "duration": "2-4h"
    },
    "evolution": {
        "script": "./run_all_quantum_experiments.sh",
        "description": "Run all quantum experiments",
        "category": "experiment",
        "patterns": ["evolution", "all experiments", "run all"],
        "duration": "variable"
    },
    "rzz": {
        "script": "cd fractional_rzz_evolution && python3 run_experiment.py",
        "description": "Fractional RZZ evolution (18-24 hours)",
        "category": "experiment",
        "patterns": ["rzz", "fractional", "long experiment"],
        "duration": "18-24h"
    },

    # AURA & ORGANISMS
    "aura": {
        "script": "./start_aura_chat.sh",
        "description": "Start AURA Chat web interface (Port 8088)",
        "category": "aura",
        "patterns": ["aura", "aura chat", "start aura", "chat interface"],
        "port": 8088
    },
    "compile": {
        "script": "python3 compile_organisms.py",
        "description": "Compile DNA organism code",
        "category": "aura",
        "patterns": ["compile", "compile organism", "build organism"],
        "supports_args": True
    },
    "chatbot": {
        "script": "python3 dnalang_aura_chatbot.py",
        "description": "Terminal-based DNALang chatbot",
        "category": "aura",
        "patterns": ["chatbot", "terminal chat", "cli chat"]
    },
    "orchestrator": {
        "script": "python3 autonomous_agi_orchestrator.py",
        "description": "AURA recursive self-improvement engine",
        "category": "aura",
        "patterns": ["orchestrator", "agi", "self-improvement", "autonomous"]
    },

    # WEB APPLICATIONS
    "portal": {
        "script": "cd project && pnpm dev",
        "description": "Launch main Quantum Portal (Port 3000)",
        "category": "web",
        "patterns": ["portal", "web portal", "main portal", "frontend"],
        "port": 3000
    },
    "backend": {
        "script": "cd agile-defense-unified/backend && ./start-backend.sh",
        "description": "Start Unified Platform backend (Ports 9000-9002)",
        "category": "web",
        "patterns": ["backend", "unified backend", "start backend"],
        "ports": [9000, 9001, 9002]
    },
    "frontend": {
        "script": "cd agile-defense-unified/frontend && pnpm dev",
        "description": "Start Unified Platform frontend (Port 3001)",
        "category": "web",
        "patterns": ["frontend", "unified frontend", "platform frontend"],
        "port": 3001
    },
    "desktop": {
        "script": "cd dnalang-desktop && pnpm dev",
        "description": "Launch DNALang Desktop app (Electron)",
        "category": "web",
        "patterns": ["desktop", "electron", "desktop app"],
        "port": 3002
    },

    # BLOCKCHAIN
    "testnet": {
        "script": "cd dnalang-token && npx hardhat run scripts/deploy.js --network base-sepolia",
        "description": "Deploy DNALang token to Base Sepolia testnet",
        "category": "blockchain",
        "patterns": ["testnet", "deploy testnet", "sepolia"]
    },
    "mainnet": {
        "script": "cd dnalang-token && npx hardhat run scripts/deploy.js --network base-mainnet",
        "description": "Deploy DNALang token to Base mainnet",
        "category": "blockchain",
        "patterns": ["mainnet", "deploy mainnet", "production deploy"]
    },
    "balance": {
        "script": "cd dnalang-token && npx hardhat run scripts/checkBalance.js",
        "description": "Check DNALang token balance",
        "category": "blockchain",
        "patterns": ["balance", "check balance", "token balance"]
    },

    # RESEARCH TOOLS
    "vqe": {
        "script": "python3 vqe_optimizer.py",
        "description": "Run VQE optimization",
        "category": "research",
        "patterns": ["vqe", "variational", "optimize circuit"]
    },
    "android": {
        "script": "cd DNALang-Android-Bridge && ./test_bridge.sh",
        "description": "Test Android-Quantum bridge",
        "category": "research",
        "patterns": ["android", "bridge", "mobile"]
    },
    "hamiltonian": {
        "script": "python3 fitness_hamiltonian_constructor.py",
        "description": "Construct fitness Hamiltonian",
        "category": "research",
        "patterns": ["hamiltonian", "fitness", "construct hamiltonian"]
    },
    "corpus": {
        "script": "python3 quantum_corpus_ingestion.py",
        "description": "Ingest quantum corpus data",
        "category": "research",
        "patterns": ["corpus", "ingest", "data ingestion"]
    },

    # SETUP & CONFIG
    "setup": {
        "script": "python3 setup_quantum.py",
        "description": "Setup IBM Quantum integration",
        "category": "setup",
        "patterns": ["setup", "configure", "initialize", "install"]
    },
    "credentials": {
        "script": "python3 configure_credentials.py",
        "description": "Configure API credentials",
        "category": "setup",
        "patterns": ["credentials", "api key", "configure credentials"]
    },
}

class NLPCommandParser:
    """Natural Language Processing for command interpretation"""

    def __init__(self):
        self.command_db = COMMAND_DATABASE

    def parse(self, user_input: str) -> Dict[str, Any]:
        """Parse natural language input to executable command"""
        user_input = user_input.lower().strip()

        # Direct command match
        if user_input in self.command_db:
            return {
                "command": user_input,
                "confidence": 1.0,
                "details": self.command_db[user_input]
            }

        # Pattern matching
        best_match = None
        best_score = 0

        for cmd_name, cmd_data in self.command_db.items():
            for pattern in cmd_data.get("patterns", []):
                if pattern in user_input:
                    score = len(pattern) / len(user_input)
                    if score > best_score:
                        best_score = score
                        best_match = cmd_name

        if best_match and best_score > 0.3:
            return {
                "command": best_match,
                "confidence": best_score,
                "details": self.command_db[best_match]
            }

        # Intent detection
        intents = self._detect_intent(user_input)
        if intents:
            return {
                "command": None,
                "intent": intents,
                "suggestions": self._get_suggestions(intents)
            }

        return {
            "command": None,
            "error": "Could not understand command",
            "suggestions": self._get_popular_commands()
        }

    def _detect_intent(self, user_input: str) -> List[str]:
        """Detect user intent from input"""
        intents = []

        # Action detection
        if any(word in user_input for word in ["start", "launch", "run", "execute"]):
            intents.append("start_service")
        if any(word in user_input for word in ["stop", "kill", "terminate"]):
            intents.append("stop_service")
        if any(word in user_input for word in ["check", "status", "list", "show"]):
            intents.append("get_status")
        if any(word in user_input for word in ["deploy", "build", "compile"]):
            intents.append("build_deploy")
        if any(word in user_input for word in ["test", "verify", "validate"]):
            intents.append("test")

        # Category detection
        if any(word in user_input for word in ["quantum", "backend", "ibm"]):
            intents.append("category:quantum")
        if any(word in user_input for word in ["web", "portal", "frontend", "backend"]):
            intents.append("category:web")
        if any(word in user_input for word in ["blockchain", "token", "deploy"]):
            intents.append("category:blockchain")
        if any(word in user_input for word in ["aura", "chat", "organism"]):
            intents.append("category:aura")

        return intents

    def _get_suggestions(self, intents: List[str]) -> List[Dict]:
        """Get command suggestions based on intents"""
        suggestions = []

        for cmd_name, cmd_data in self.command_db.items():
            score = 0
            for intent in intents:
                if intent.startswith("category:"):
                    category = intent.split(":")[1]
                    if cmd_data.get("category", "").startswith(category[:3]):
                        score += 2
                elif intent == "start_service" and "port" in cmd_data:
                    score += 1
                elif intent == "test" and cmd_data.get("category") == "quick_test":
                    score += 2

            if score > 0:
                suggestions.append({
                    "command": cmd_name,
                    "description": cmd_data["description"],
                    "score": score
                })

        # Sort by score and return top 5
        suggestions.sort(key=lambda x: x["score"], reverse=True)
        return suggestions[:5]

    def _get_popular_commands(self) -> List[Dict]:
        """Get popular/recommended commands"""
        popular = ["backends", "aura", "portal", "proof", "nobel"]
        return [
            {
                "command": cmd,
                "description": self.command_db[cmd]["description"]
            }
            for cmd in popular if cmd in self.command_db
        ]

# Initialize NLP parser
nlp_parser = NLPCommandParser()

@app.get("/", response_class=HTMLResponse)
async def get_dashboard():
    """Serve the main dashboard UI"""
    html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DNALang Unified Command Center</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #fff;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }

        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .subtitle {
            font-size: 1.1rem;
            opacity: 0.9;
        }

        .main-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 20px;
            margin-bottom: 20px;
        }

        .panel {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 25px;
            color: #333;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }

        .panel h2 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 1.5rem;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }

        .command-input-section {
            margin-bottom: 20px;
        }

        .input-group {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }

        input[type="text"] {
            flex: 1;
            padding: 15px;
            border: 2px solid #667eea;
            border-radius: 10px;
            font-size: 1rem;
            transition: all 0.3s;
        }

        input[type="text"]:focus {
            outline: none;
            border-color: #764ba2;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }

        button {
            padding: 15px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }

        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        button:active {
            transform: translateY(0);
        }

        .quick-commands {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .quick-cmd {
            padding: 8px 15px;
            background: #f0f0f0;
            border: 1px solid #667eea;
            border-radius: 20px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s;
        }

        .quick-cmd:hover {
            background: #667eea;
            color: white;
            transform: translateY(-2px);
        }

        .output-section {
            background: #1e1e1e;
            color: #d4d4d4;
            border-radius: 10px;
            padding: 20px;
            min-height: 400px;
            max-height: 600px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            line-height: 1.5;
        }

        .output-line {
            margin-bottom: 5px;
            animation: fadeIn 0.3s;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .service-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 10px;
            border-left: 4px solid #667eea;
        }

        .service-card h3 {
            color: #667eea;
            margin-bottom: 5px;
        }

        .service-status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-top: 5px;
        }

        .status-running {
            background: #d4edda;
            color: #155724;
        }

        .status-stopped {
            background: #f8d7da;
            color: #721c24;
        }

        .category-section {
            margin-bottom: 20px;
        }

        .category-title {
            font-weight: 600;
            color: #764ba2;
            margin-bottom: 10px;
            font-size: 1.1rem;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-top: 20px;
        }

        .stat-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }

        .stat-number {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
        }

        .success { color: #28a745; }
        .error { color: #dc3545; }
        .info { color: #17a2b8; }
        .warning { color: #ffc107; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🧬 DNALang Unified Command Center</h1>
            <p class="subtitle">Natural Language Interface to All Quantum Features</p>
        </header>

        <div class="main-grid">
            <div class="panel">
                <h2>📊 System Overview</h2>
                <div class="stats-grid">
                    <div class="stat-box">
                        <div class="stat-number" id="total-commands">29</div>
                        <div class="stat-label">Commands</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number" id="active-services">0</div>
                        <div class="stat-label">Active</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number" id="commands-run">0</div>
                        <div class="stat-label">Executed</div>
                    </div>
                </div>

                <div style="margin-top: 25px;">
                    <h3 style="color: #667eea; margin-bottom: 15px;">🚀 Quick Actions</h3>
                    <div class="quick-commands">
                        <div class="quick-cmd" onclick="runCommand('check quantum backends')">Check Backends</div>
                        <div class="quick-cmd" onclick="runCommand('start aura chat')">Start AURA</div>
                        <div class="quick-cmd" onclick="runCommand('launch portal')">Main Portal</div>
                        <div class="quick-cmd" onclick="runCommand('run proof')">Quick Proof</div>
                        <div class="quick-cmd" onclick="runCommand('list services')">List Services</div>
                        <div class="quick-cmd" onclick="runCommand('help')">Help</div>
                    </div>
                </div>

                <div style="margin-top: 25px;">
                    <h3 style="color: #667eea; margin-bottom: 15px;">📡 Active Services</h3>
                    <div id="services-list">
                        <p style="color: #999; font-style: italic;">No services running</p>
                    </div>
                </div>
            </div>

            <div class="panel">
                <h2>💬 Command Interface</h2>
                <div class="command-input-section">
                    <div class="input-group">
                        <input
                            type="text"
                            id="command-input"
                            placeholder="Type your command in natural language... (e.g., 'start aura chat', 'check quantum backends', 'run nobel experiment')"
                            autocomplete="off"
                        />
                        <button onclick="executeCommand()">Execute</button>
                    </div>
                    <p style="color: #999; font-size: 0.9rem; margin-top: 10px;">
                        💡 Try: "what can you do", "start aura", "run quantum proof", "list services"
                    </p>
                </div>

                <h3 style="color: #667eea; margin-bottom: 15px;">📺 Output</h3>
                <div class="output-section" id="output">
                    <div class="output-line info">🧬 DNALang Command Center ready. Type a command or click a quick action.</div>
                    <div class="output-line">System initialized at: <span id="init-time"></span></div>
                </div>
            </div>
        </div>

        <div class="panel">
            <h2>📚 Available Commands by Category</h2>
            <div id="commands-catalog"></div>
        </div>
    </div>

    <script>
        let commandsExecuted = 0;

        // Initialize timestamp
        document.getElementById('init-time').textContent = new Date().toLocaleString();

        // Command input enter key
        document.getElementById('command-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                executeCommand();
            }
        });

        function runCommand(cmd) {
            document.getElementById('command-input').value = cmd;
            executeCommand();
        }

        async function executeCommand() {
            const input = document.getElementById('command-input').value.trim();
            if (!input) return;

            addOutput(`> ${input}`, 'info');

            try {
                const response = await fetch('/execute', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ command: input })
                });

                const result = await response.json();

                if (result.success) {
                    addOutput(`✅ ${result.message}`, 'success');
                    if (result.output) {
                        result.output.split('\\n').forEach(line => {
                            if (line.trim()) addOutput(line);
                        });
                    }
                    commandsExecuted++;
                    document.getElementById('commands-run').textContent = commandsExecuted;
                } else {
                    addOutput(`❌ ${result.error}`, 'error');
                    if (result.suggestions && result.suggestions.length > 0) {
                        addOutput('💡 Did you mean:', 'info');
                        result.suggestions.forEach(sug => {
                            addOutput(`   • ${sug.command}: ${sug.description}`, 'warning');
                        });
                    }
                }
            } catch (error) {
                addOutput(`❌ Error: ${error.message}`, 'error');
            }

            document.getElementById('command-input').value = '';
            updateServices();
        }

        function addOutput(text, className = '') {
            const output = document.getElementById('output');
            const line = document.createElement('div');
            line.className = `output-line ${className}`;
            line.textContent = text;
            output.appendChild(line);
            output.scrollTop = output.scrollHeight;
        }

        async function updateServices() {
            try {
                const response = await fetch('/services');
                const services = await response.json();

                const servicesList = document.getElementById('services-list');
                const activeCount = Object.keys(services).length;

                document.getElementById('active-services').textContent = activeCount;

                if (activeCount === 0) {
                    servicesList.innerHTML = '<p style="color: #999; font-style: italic;">No services running</p>';
                } else {
                    servicesList.innerHTML = '';
                    for (const [name, info] of Object.entries(services)) {
                        const card = document.createElement('div');
                        card.className = 'service-card';
                        card.innerHTML = `
                            <h3>${name}</h3>
                            <p style="font-size: 0.9rem; color: #666;">${info.description || ''}</p>
                            <span class="service-status status-running">● Running</span>
                        `;
                        servicesList.appendChild(card);
                    }
                }
            } catch (error) {
                console.error('Failed to update services:', error);
            }
        }

        async function loadCommandsCatalog() {
            try {
                const response = await fetch('/commands');
                const commands = await response.json();

                const catalog = document.getElementById('commands-catalog');
                const categories = {
                    'quick_test': '⚡ Quick Tests (< 2 min)',
                    'experiment': '🔬 Experiments',
                    'aura': '🤖 AURA & Organisms',
                    'web': '🌐 Web Applications',
                    'blockchain': '⛓️ Blockchain',
                    'research': '📊 Research Tools',
                    'setup': '⚙️ Setup & Config'
                };

                for (const [catKey, catName] of Object.entries(categories)) {
                    const categoryDiv = document.createElement('div');
                    categoryDiv.className = 'category-section';
                    categoryDiv.innerHTML = `<div class="category-title">${catName}</div>`;

                    const catCommands = Object.entries(commands).filter(([_, cmd]) => cmd.category === catKey);

                    catCommands.forEach(([name, cmd]) => {
                        const cmdDiv = document.createElement('div');
                        cmdDiv.className = 'quick-cmd';
                        cmdDiv.textContent = `${name}: ${cmd.description}`;
                        cmdDiv.onclick = () => runCommand(name);
                        categoryDiv.appendChild(cmdDiv);
                    });

                    if (catCommands.length > 0) {
                        catalog.appendChild(categoryDiv);
                    }
                }
            } catch (error) {
                console.error('Failed to load commands:', error);
            }
        }

        // Auto-update services every 5 seconds
        setInterval(updateServices, 5000);

        // Load commands catalog on page load
        loadCommandsCatalog();
    </script>
</body>
</html>
    """
    return HTMLResponse(content=html_content)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/commands")
async def get_commands():
    """Get all available commands"""
    return JSONResponse(COMMAND_DATABASE)

@app.get("/services")
async def get_services():
    """Get currently running services"""
    return JSONResponse(running_services)

@app.post("/execute")
async def execute_command(request: dict):
    """Execute a natural language command"""
    try:
        user_input = request.get("command", "").strip()
        if not user_input:
            return JSONResponse({
                "success": False,
                "error": "No command provided"
            })

        # Parse command using NLP
        parsed = nlp_parser.parse(user_input)

        # Handle special commands
        if user_input.lower() in ["help", "what can you do", "commands", "list commands"]:
            return JSONResponse({
                "success": True,
                "message": "Available commands by category",
                "commands": COMMAND_DATABASE
            })

        if user_input.lower() in ["list services", "show services", "services"]:
            return JSONResponse({
                "success": True,
                "message": f"Currently running {len(running_services)} services",
                "services": running_services
            })

        if not parsed.get("command"):
            return JSONResponse({
                "success": False,
                "error": parsed.get("error", "Command not understood"),
                "suggestions": parsed.get("suggestions", [])
            })

        # Execute the command
        cmd_name = parsed["command"]
        cmd_details = parsed["details"]
        script = cmd_details["script"]

        # Add to command history
        command_history.append({
            "command": user_input,
            "parsed": cmd_name,
            "timestamp": datetime.now().isoformat()
        })

        # Execute the script
        try:
            result = subprocess.run(
                script,
                shell=True,
                capture_output=True,
                text=True,
                timeout=5  # 5 second timeout for initial response
            )

            output = result.stdout if result.stdout else result.stderr

            # Track running services
            if "port" in cmd_details or "ports" in cmd_details:
                running_services[cmd_name] = {
                    "description": cmd_details["description"],
                    "started_at": datetime.now().isoformat(),
                    "port": cmd_details.get("port") or cmd_details.get("ports")
                }

            return JSONResponse({
                "success": True,
                "message": f"Executed: {cmd_details['description']}",
                "output": output[:1000],  # Limit output
                "command": cmd_name
            })

        except subprocess.TimeoutExpired:
            # Command is running in background
            running_services[cmd_name] = {
                "description": cmd_details["description"],
                "started_at": datetime.now().isoformat(),
                "port": cmd_details.get("port") or cmd_details.get("ports"),
                "status": "running"
            }

            return JSONResponse({
                "success": True,
                "message": f"Started: {cmd_details['description']}",
                "command": cmd_name,
                "background": True
            })

        except Exception as e:
            return JSONResponse({
                "success": False,
                "error": f"Execution failed: {str(e)}",
                "command": cmd_name
            })

    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)

@app.get("/history")
async def get_history():
    """Get command execution history"""
    return JSONResponse(command_history)

if __name__ == "__main__":
    print("=" * 70)
    print("🧬 DNALang Unified Command Center")
    print("   Natural Language Interface to All Features")
    print("=" * 70)
    print()
    print("🌐 Web Interface: http://localhost:7777")
    print("📡 API Docs: http://localhost:7777/docs")
    print()
    print("✨ Features:")
    print("   • Natural language command processing")
    print("   • 29+ integrated commands across all projects")
    print("   • Real-time service monitoring")
    print("   • Web-based dashboard")
    print()
    print("💡 Example commands:")
    print("   • 'check quantum backends'")
    print("   • 'start aura chat'")
    print("   • 'launch main portal'")
    print("   • 'run nobel experiment'")
    print()
    print("Press Ctrl+C to stop the server")
    print("=" * 70)
    print()

    uvicorn.run(app, host="0.0.0.0", port=7777, log_level="info")
