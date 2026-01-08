#!/bin/bash

# Commit script for GhostClass changes

git add .
git commit -m "fix(quiz): resolve infinite loop in Quiz component and add role-based validation"
git push

echo "✅ Changes committed and pushed successfully!"
