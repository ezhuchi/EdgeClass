#!/bin/bash

echo "==================================="
echo "GhostClass - Quick Deploy to Render"
echo "==================================="
echo ""

# Check if git repo is clean
if [[ -n $(git status -s) ]]; then
    echo "Committing changes..."
    git add .
    git commit -m "chore: prepare for Render deployment"
fi

echo "Pushing to GitHub..."
git push origin main

echo ""
echo "✓ Code pushed to GitHub successfully!"
echo ""
echo "Next steps:"
echo "1. Go to https://render.com"
echo "2. Sign up/Login with GitHub"
echo "3. Click 'New' → 'Blueprint'"
echo "4. Select your EdgeClass repository"
echo "5. Click 'Apply'"
echo ""
echo "Your app will be live in 3-5 minutes at:"
echo "https://ghostclass.onrender.com"
echo ""
echo "To add custom domain:"
echo "Settings → Custom Domain → Add your domain"
echo ""
