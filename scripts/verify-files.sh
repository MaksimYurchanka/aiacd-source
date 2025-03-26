#!/bin/bash

# AI-AutoCoding-DAO File Verification Script
# This script checks if all necessary files exist and have content

# Terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}AI-AutoCoding-DAO File Verification${NC}"
echo -e "${BLUE}=================================${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${YELLOW}Working directory: ${PROJECT_ROOT}${NC}"

# Required files
REQUIRED_FILES=(
  "src/orchestration/selector.js"
  "src/orchestration/analyzer.js"
  "src/orchestration/token-tracker.js"
  "src/orchestration/templates.js"
  "src/tools/claude-direct.js"
  "src/evaluation/quality-analyzer.js"
  "src/evaluation/comparator.js"
  "src/index.js"
  "README.md"
  "LICENSE"
  ".github/workflows/ci.yml"
  "package.json"
  ".env"
  "scripts/run.js"
)

# Check if files exist and have content
MISSING_FILES=()
EMPTY_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$PROJECT_ROOT/$file" ]; then
    MISSING_FILES+=("$file")
  elif [ ! -s "$PROJECT_ROOT/$file" ]; then
    EMPTY_FILES+=("$file")
  fi
done

# Report status
if [ ${#MISSING_FILES[@]} -eq 0 ] && [ ${#EMPTY_FILES[@]} -eq 0 ]; then
  echo -e "${GREEN}✓ All required files are present and have content.${NC}"
else
  if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo -e "${RED}✗ Missing files:${NC}"
    for file in "${MISSING_FILES[@]}"; do
      echo -e "  - ${RED}$file${NC}"
    done
  fi
  
  if [ ${#EMPTY_FILES[@]} -gt 0 ]; then
    echo -e "${RED}✗ Empty files:${NC}"
    for file in "${EMPTY_FILES[@]}"; do
      echo -e "  - ${YELLOW}$file${NC}"
    done
  fi
  
  echo -e "${RED}Please ensure all required files are present and have content before proceeding.${NC}"
  exit 1
fi

# Check directory structure
REQUIRED_DIRS=(
  "src/orchestration"
  "src/tools"
  "src/evaluation"
  "src/utils"
  "src/data/templates"
  "docs"
  "scripts"
  "examples"
  ".github/workflows"
)

MISSING_DIRS=()

for dir in "${REQUIRED_DIRS[@]}"; do
  if [ ! -d "$PROJECT_ROOT/$dir" ]; then
    MISSING_DIRS+=("$dir")
  fi
done

if [ ${#MISSING_DIRS[@]} -eq 0 ]; then
  echo -e "${GREEN}✓ All required directories are present.${NC}"
else
  echo -e "${RED}✗ Missing directories:${NC}"
  for dir in "${MISSING_DIRS[@]}"; do
    echo -e "  - ${RED}$dir${NC}"
  done
  
  echo -e "${YELLOW}Creating missing directories...${NC}"
  for dir in "${MISSING_DIRS[@]}"; do
    mkdir -p "$PROJECT_ROOT/$dir"
    echo -e "  - Created ${GREEN}$dir${NC}"
  done
fi

# Check git setup
echo -e "\n${YELLOW}Checking git setup...${NC}"

if [ ! -d "$PROJECT_ROOT/.git" ]; then
  echo -e "${RED}✗ Git repository not initialized.${NC}"
  echo -e "${YELLOW}Initialize git repository? (y/n)${NC}"
  read init_git
  
  if [ "$init_git" = "y" ] || [ "$init_git" = "Y" ]; then
    cd "$PROJECT_ROOT"
    git init
    echo -e "${GREEN}✓ Git repository initialized.${NC}"
  else
    echo -e "${YELLOW}Skipping git initialization.${NC}"
  fi
else
  echo -e "${GREEN}✓ Git repository already initialized.${NC}"
  
  # Check if files are staged
  UNSTAGED_FILES=$(git -C "$PROJECT_ROOT" status --porcelain | wc -l)
  
  if [ $UNSTAGED_FILES -gt 0 ]; then
    echo -e "${YELLOW}There are unstaged changes.${NC}"
    echo -e "${YELLOW}Stage all changes? (y/n)${NC}"
    read stage_changes
    
    if [ "$stage_changes" = "y" ] || [ "$stage_changes" = "Y" ]; then
      git -C "$PROJECT_ROOT" add .
      echo -e "${GREEN}✓ Changes staged.${NC}"
    else
      echo -e "${YELLOW}Skipping staging changes.${NC}"
    fi
  else
    echo -e "${GREEN}✓ No unstaged changes.${NC}"
  fi
fi

echo -e "\n${BLUE}=================================${NC}"
echo -e "${GREEN}Verification complete!${NC}"
echo -e "${BLUE}=================================${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Make sure to update the .env file with your actual API keys."
echo -e "2. Run 'npm install' to install dependencies."
echo -e "3. Push to GitHub with 'git push -u origin main'."
echo -e "4. Start using the framework with 'npm start'."

exit 0
