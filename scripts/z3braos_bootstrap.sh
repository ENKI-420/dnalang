#!/bin/bash
# Z3braOS Bootstrap Script
# Builds and runs Z3braOS-Quantum Edition v9.0.CRSM7D

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
Z3BRAOS_DIR="$PROJECT_ROOT/z3braos"

echo "═══════════════════════════════════════════════════════"
echo " Z3braOS-Quantum Edition v9.0.CRSM7D Bootstrap"
echo "═══════════════════════════════════════════════════════"
echo

# Check for Rust
if ! command -v cargo &> /dev/null; then
    echo "[ERROR] Rust/Cargo not found. Please install Rust first."
    echo "        Visit: https://rustup.rs/"
    exit 1
fi

echo "[1/3] Checking Rust toolchain..."
rustc --version
cargo --version
echo

echo "[2/3] Building Z3braOS..."
cd "$Z3BRAOS_DIR"
cargo build --release
echo

echo "[3/3] Launching Z3braOS..."
echo
cargo run --release
