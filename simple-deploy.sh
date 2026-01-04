#!/bin/bash

# ===================================
# SIMPLE ZERO-ERROR GIT DEPLOY SCRIPT
# For paytax.com (MERN Stack) – Easy & Safe
# ===================================

echo "🚀 Starting Safe Deploy for paytax.com"

# 1. Check we're in the right folder
if [[ ! -f package.json ]]; then
  echo "❌ Error: package.json not found. Run this in your project root!"
  exit 1
fi

# 2. Run code checks
echo "🔍 Running checks..."

npx eslint . --fix --max-warnings=0
if [[ $? -ne 0 ]]; then
  echo "❌ ESLint found errors – fix them first!"
  exit 1
fi

npm run build
if [[ $? -ne 0 ]]; then
  echo "❌ Build failed – check your code!"
  exit 1
fi

npm test
if [[ $? -ne 0 ]]; then
  echo "❌ Tests failed – fix them before deploying!"
  exit 1
fi

echo "✅ All checks passed!"

# 3. Protect secrets (.env files)
if git status --porcelain | grep -E '\.env($ |[^.]| $)'; then
  echo "🚫 Found .env file(s) – removing from commit (secrets must stay private!)"
  git reset *.env 2>/dev/null
  echo "   → Only commit .env.example"
fi

# 4. Show what will be committed
echo "📋 Changes to commit:"
git diff --cached --stat
echo ""
git status --short

read -p "✅ Looks good? Press Enter to commit (or Ctrl+C to cancel)"

# 5. Simple commit message
echo "Write your commit message (Conventional Commit style recommended):"
echo "Examples: feat: add user login | fix: repair payment bug | chore: update dependencies"
read -p "> " MESSAGE

if [[ -z "$MESSAGE" ]]; then
  echo "❌ No message entered – aborting"
  exit 1
fi

git commit -m "$MESSAGE"

# 6. Sync with remote & push safely
echo "🔄 Fetching latest from server..."
git fetch origin

CURRENT_BRANCH=$(git branch --show-current)
echo "🌿 On branch: $CURRENT_BRANCH"

# If others pushed new changes, suggest pulling
if [[ $(git log origin/$CURRENT_BRANCH..$CURRENT_BRANCH --oneline | wc -l) -eq 0 ]] && [[ $(git log $CURRENT_BRANCH..origin/$CURRENT_BRANCH --oneline | wc -l) -gt 0 ]]; then
  echo "⚠️ New changes on server – pulling with rebase..."
  git pull --rebase origin $CURRENT_BRANCH
  if [[ $? -ne 0 ]]; then
    echo "❌ Conflicts! Fix them manually, then run 'git rebase --continue'"
    exit 1
  fi
fi

# Final push
echo "🚀 Pushing to server..."
git push origin $CURRENT_BRANCH

if [[ $? -eq 0 ]]; then
  echo "🎉 SUCCESS! Your code is live on $CURRENT_BRANCH"
  echo "   Monitor: https://dashboard.render.com (or your hosting)"
else
  echo "❌ Push failed – check your internet or permissions"
fi
