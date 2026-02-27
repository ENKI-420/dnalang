#!/bin/bash
##
# DNALang Unified Command Center Launcher
# Single platform with NLP to control all features
##

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🧬 DNALang Unified Command Center${NC}"
echo -e "${GREEN}   Natural Language Interface to All Features${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# Check Python version
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Python 3 not found. Please install Python 3.8+${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo -e "${BLUE}🐍 Python Version:${NC} $PYTHON_VERSION"

# Check and install dependencies
echo -e "${BLUE}📦 Checking dependencies...${NC}"
python3 -c "import fastapi" 2>/dev/null || {
    echo -e "${YELLOW}Installing FastAPI...${NC}"
    pip3 install -q fastapi uvicorn[standard]
}

echo -e "${GREEN}✅ Dependencies ready${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Start the command center
echo -e "${BLUE}🚀 Starting Command Center...${NC}"
echo ""
echo -e "${GREEN}Access the dashboard at:${NC} ${BLUE}http://localhost:7777${NC}"
echo ""
echo -e "${YELLOW}💡 Try these commands in the web interface:${NC}"
echo "   • 'check quantum backends'"
echo "   • 'start aura chat'"
echo "   • 'launch portal'"
echo "   • 'run quick proof'"
echo "   • 'what can you do'"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# Run the command center
python3 dnalang_command_center.py
