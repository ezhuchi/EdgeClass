#!/bin/bash

# Commit script for GhostClass changes

cd "$(dirname "$0")"

git add .
git commit -m "fix(quiz): resolve infinite loop in Quiz component and add role-based validation"

echo "✅ Changes committed successfully!"
