#!/bin/bash

# AI-AutoCoding-DAO GitHub Push Script
# This script helps push the AI-AutoCoding-DAO to GitHub

# Terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}AI-AutoCoding-DAO GitHub Push${NC}"
echo -e "${BLUE}=================================${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Verify files first
if [ -f "$SCRIPT_DIR/verify-files.sh" ]; then
    bash "$SCRIPT_DIR/verify-files.sh"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}File verification failed. Please fix the issues before pushing to GitHub.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}verify-files.sh script not found. Skipping file verification.${NC}"
fi

# Make sure we're in the project root
cd "$PROJECT_ROOT"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Git repository not initialized. Initializing...${NC}"
    git init
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to initialize git repository.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Git repository initialized.${NC}"
fi

# Check GitHub username
echo -e "\n${YELLOW}Please enter your GitHub username:${NC}"
read github_username

if [ -z "$github_username" ]; then
    echo -e "${RED}No username provided. Exiting.${NC}"
    exit 1
fi

# Check repository name
echo -e "\n${YELLOW}Please enter the repository name (default: ai-autocoding-dao):${NC}"
read repo_name

if [ -z "$repo_name" ]; then
    repo_name="ai-autocoding-dao"
    echo -e "${YELLOW}Using default name: $repo_name${NC}"
fi

# Check if remote origin exists
if git remote | grep -q "^origin$"; then
    echo -e "${YELLOW}Remote 'origin' already exists. Updating...${NC}"
    git remote set-url origin "https://github.com/$github_username/$repo_name.git"
else
    echo -e "${YELLOW}Setting up remote 'origin'...${NC}"
    git remote add origin "https://github.com/$github_username/$repo_name.git"
fi

echo -e "${GREEN}Remote 'origin' set to https://github.com/$github_username/$repo_name.git${NC}"

# Add files to git
echo -e "\n${YELLOW}Adding files to git...${NC}"
git add .

# Commit changes
echo -e "\n${YELLOW}Committing changes...${NC}"
git commit -m "Initial commit for AI-AutoCoding-DAO"

# Set main branch
git branch -M main

# Push to GitHub
echo -e "\n${YELLOW}Pushing to GitHub...${NC}"
echo -e "${YELLOW}This may prompt for your GitHub credentials.${NC}"
git push -u origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Successfully pushed to GitHub!${NC}"
    echo -e "\n${BLUE}=================================${NC}"
    echo -e "${GREEN}Repository URL: https://github.com/$github_username/$repo_name${NC}"
    echo -e "${BLUE}=================================${NC}"
else
    echo -e "${RED}Failed to push to GitHub.${NC}"
    echo -e "${YELLOW}You can try pushing manually with:${NC}"
    echo -e "git push -u origin main"
fi

exit 0
