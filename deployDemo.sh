#!/bin/bash

# Stop on error
set -euo pipefail

# Colors for clarity
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Branch to deploy
BRANCH="${1:-master}"  

echo -e "${GREEN}➡️  Switching to branch: $BRANCH${NC}"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

echo -e "${GREEN}⬇️  Installing Node.js dependencies...${NC}"
npm install

echo -e "${GREEN}🚀 Starting VR Training Server...${NC}"
npm start