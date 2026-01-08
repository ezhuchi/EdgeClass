#!/bin/bash

echo "==================================="
echo "GhostClass - Deploy to Render"
echo "==================================="
echo ""

# Check if git repo exists
if [ ! -d .git ]; then
    echo "ERROR: Not a git repository. Initialize git first:"
    echo "  git init"
    echo "  git add ."
    echo "  git commit -m 'Initial commit'"
    exit 1
fi

# Check if changes need to be committed
if [[ -n $(git status -s) ]]; then
    echo "You have uncommitted changes."
    read -p "Commit and push now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Commit message: " commit_msg
        git commit -m "$commit_msg"
    else
        echo "Deployment cancelled. Commit your changes first."
        exit 1
    fi
fi

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "ERROR: No remote 'origin' found."
    echo "Add your GitHub repository:"
    echo "  git remote add origin <your-repo-url>"
    exit 1
fi

echo "Pushing to GitHub..."
git push origin main || git push origin master

echo ""
echo "SUCCESS: Code pushed to GitHub"
echo ""
echo "==================================="
echo "Deploy to Render - Manual Steps"
echo "==================================="
echo ""
echo "1. Visit: https://render.com"
echo "2. Sign up or login with GitHub"
echo "3. Click 'New +' button"
echo "4. Select 'Blueprint'"
echo "5. Connect your GitHub account (if not already)"
echo "6. Select your 'EdgeClass' repository"
echo "7. Click 'Apply'"
echo ""
echo "Render will automatically:"
echo "  - Install dependencies"
echo "  - Build frontend"
echo "  - Start backend server"
echo "  - Create persistent storage for database"
echo ""
echo "Your app will be live at:"
echo "  https://<your-service-name>.onrender.com"
echo ""
echo "Build time: 3-5 minutes"
echo ""
