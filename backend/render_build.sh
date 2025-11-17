#!/usr/bin/env bash
# Render build script for TripSync Backend

set -o errexit

echo "📦 Installing Python dependencies..."
pip install --upgrade pip

# Install dependencies with pre-built wheels only
pip install --only-binary=:all: -r requirements.txt || pip install -r requirements.txt

echo "✅ Build completed successfully!"
