# Git Backup and Restore Guide

**Purpose:** Learn how to create backups, restore previous versions, and safely experiment with code

---

## 🎯 Quick Reference

### Create a Backup Before Making Changes
```bash
# Create a backup branch
git branch backup-jan7-before-testing
git push origin backup-jan7-before-testing
```

### Restore from Backup
```bash
# Switch to the backup branch
git checkout backup-jan7-before-testing

# Or restore specific files
git checkout backup-jan7-before-testing -- path/to/file
```

---

## 📚 Complete Guide

### 1. Understanding Git Backups

Git automatically backs up everything you commit! Every commit is a snapshot of your entire codebase.

**Three types of backups:**
1. **Local commits** - On your machine only
2. **Remote branches** - On GitHub (safe backup)
3. **Tags** - Named snapshots (like "v1.0.0")

---

## 🔄 Method 1: Create a Backup Branch (RECOMMENDED)

### Step 1: Create a Backup Branch

**Before making risky changes:**

```bash
# Make sure you're on master
git checkout master

# Pull latest changes
git pull origin master

# Create a backup branch with today's date
git branch backup-2026-01-07-working-version

# Push backup to GitHub (safe remote storage)
git push origin backup-2026-01-07-working-version
```

**What this does:**
- Creates a "snapshot" branch of your current code
- Stores it on GitHub (safe from local machine issues)
- You can restore from it anytime

### Step 2: Continue Working on Master

```bash
# You're still on master
git status

# Make your changes, test, commit as normal
git add .
git commit -m "Experimental: testing invoice fix"
git push origin master
```

### Step 3: Restore from Backup (If Needed)

**Option A: Completely restore master to backup state**
```bash
# Switch to master
git checkout master

# Reset master to backup state (DESTRUCTIVE!)
git reset --hard backup-2026-01-07-working-version

# Force push to GitHub (WARNING: overwrites history!)
git push origin master --force
```

**Option B: Restore just one file**
```bash
# Stay on master
git checkout master

# Restore specific file from backup
git checkout backup-2026-01-07-working-version -- backend/src/routes/invoice.routes.ts

# Commit the restoration
git add backend/src/routes/invoice.routes.ts
git commit -m "Restore invoice routes from backup"
git push origin master
```

---

## 🏷️ Method 2: Create a Git Tag (Version Marker)

### Step 1: Create a Tag

```bash
# Create a tag for current working version
git tag -a v1.0-working -m "Working version before invoice debugging"

# Push tag to GitHub
git push origin v1.0-working
```

### Step 2: List All Tags

```bash
# See all tags
git tag -l

# See tag details
git show v1.0-working
```

### Step 3: Restore from Tag

```bash
# Create a new branch from the tag
git checkout -b restore-from-v1 v1.0-working

# Or restore master to the tag
git checkout master
git reset --hard v1.0-working
git push origin master --force
```

---

## 📦 Method 3: Simple Commit-Based Backup

### Step 1: Commit Everything First

```bash
# Make sure all changes are committed
git add .
git commit -m "Backup: Working state before debugging"
git push origin master

# Note the commit hash (first 7 characters)
git log --oneline -1
# Example output: a1b2c3d Backup: Working state before debugging
```

### Step 2: Make Your Changes

```bash
# Edit files, test changes
# ...

git add .
git commit -m "Experimental: trying to fix invoices"
git push origin master
```

### Step 3: Restore from Specific Commit

```bash
# Find the commit hash
git log --oneline -10

# Restore to that commit
git reset --hard a1b2c3d  # Use your commit hash

# Push to GitHub
git push origin master --force
```

---

## 🔍 Method 4: View History and Compare

### See Commit History

```bash
# View recent commits
git log --oneline -10

# View changes in a commit
git show a1b2c3d

# View commit with file changes
git log --stat
```

### Compare with Previous Version

```bash
# Compare current version with backup branch
git diff backup-2026-01-07-working-version

# Compare specific file
git diff backup-2026-01-07-working-version -- backend/src/routes/invoice.routes.ts

# Compare current with 5 commits ago
git diff HEAD~5
```

---

## 🎯 Recommended Workflow for Your Situation

### Before Testing on Laptop

**On Desktop (current machine):**

```bash
cd "c:\Users\the quiet australian\accounting-software"

# 1. Make sure everything is committed
git add .
git commit -m "Desktop: Latest changes with debugging logs"
git push origin master

# 2. Create backup branch
git branch backup-jan7-desktop-latest
git push origin backup-jan7-desktop-latest

# 3. Optionally create a tag
git tag -a v2026.01.07-desktop -m "Desktop version before laptop testing"
git push origin v2026.01.07-desktop
```

**On Laptop:**

```bash
cd ~/accounting-software

# 1. Pull latest from desktop
git pull origin master

# 2. Create backup before local testing
git branch backup-jan7-laptop-before-test
git push origin backup-jan7-laptop-before-test

# 3. Test locally (don't commit yet!)
npm run dev  # in backend and frontend

# 4. If you make fixes that work:
git add .
git commit -m "Fix: Invoice creation working - <describe what fixed it>"
git push origin master
```

---

## 🚨 Emergency Restore Scenarios

### Scenario 1: "I broke everything, restore to last working state"

```bash
# Option 1: Use backup branch
git checkout master
git reset --hard backup-jan7-desktop-latest
git push origin master --force

# Option 2: Use tag
git checkout master
git reset --hard v2026.01.07-desktop
git push origin master --force

# Option 3: Revert to specific commit
git log --oneline -20  # Find working commit
git reset --hard <commit-hash>
git push origin master --force
```

### Scenario 2: "I need to see what changed between versions"

```bash
# Compare current with backup
git diff backup-jan7-desktop-latest

# See what commits happened
git log backup-jan7-desktop-latest..master --oneline

# Compare specific file
git diff backup-jan7-desktop-latest -- backend/src/routes/invoice.routes.ts
```

### Scenario 3: "I want to try something risky without affecting master"

```bash
# Create experimental branch
git checkout -b experiment-invoice-fix

# Make changes, test
# ...

# If it works, merge to master
git checkout master
git merge experiment-invoice-fix
git push origin master

# If it doesn't work, just delete the branch
git checkout master
git branch -D experiment-invoice-fix
```

---

## 📋 Checklist: Creating a Backup Right Now

**On Desktop (before switching to laptop):**

```bash
# Step 1: Check current status
cd "c:\Users\the quiet australian\accounting-software"
git status

# Step 2: Commit any uncommitted changes
git add .
git commit -m "Desktop: Pre-laptop-testing backup"

# Step 3: Create backup branch
git branch backup-2026-01-07-21-45-desktop
git push origin backup-2026-01-07-21-45-desktop

# Step 4: Create a tag (optional but recommended)
git tag -a desktop-working-2026-01-07 -m "Desktop state before laptop testing"
git push origin desktop-working-2026-01-07

# Step 5: Verify backup exists on GitHub
# Go to: https://github.com/harinds/accounting-software/branches
# You should see: backup-2026-01-07-21-45-desktop
```

**Verification:**
```bash
# List all branches
git branch -a

# Should show:
# * master
#   backup-2026-01-07-21-45-desktop
#   remotes/origin/master
#   remotes/origin/backup-2026-01-07-21-45-desktop
```

---

## 🔐 Safety Tips

### ✅ DO:
- Create backups before risky changes
- Push backups to GitHub (remote storage)
- Use descriptive branch/tag names with dates
- Commit often with clear messages
- Test locally before pushing to master

### ❌ DON'T:
- Use `--force` push unless you're sure
- Delete branches until you're certain you don't need them
- Work on master for experimental changes (use branches)
- Push untested code to production

---

## 📊 Visual Guide

### Current State
```
master (HEAD) ─────────●  (Your current work)
                       │
                       └── backup-jan7-desktop-latest (Backup point)
```

### After Making Changes
```
master (HEAD) ─────────●────●────●  (New commits)
                       │
                       └── backup-jan7-desktop-latest (Safe restore point)
```

### If You Need to Restore
```
master (HEAD) ─────────●  (Reset back to backup)
                       │
                       └── backup-jan7-desktop-latest
```

---

## 🎯 Quick Commands Summary

```bash
# CREATE BACKUP
git branch backup-$(date +%Y-%m-%d)
git push origin backup-$(date +%Y-%m-%d)

# LIST BACKUPS
git branch -a

# RESTORE FROM BACKUP
git reset --hard backup-2026-01-07
git push origin master --force

# RESTORE SINGLE FILE
git checkout backup-2026-01-07 -- path/to/file.ts

# VIEW HISTORY
git log --oneline -10

# COMPARE WITH BACKUP
git diff backup-2026-01-07
```

---

## 💡 Best Practices for Your Project

### Daily Backup Routine
```bash
# End of each work session
git add .
git commit -m "End of day: <what you accomplished>"
git push origin master

# Before major changes
git branch backup-before-<feature-name>
git push origin backup-before-<feature-name>
```

### Before Production Deployment
```bash
git tag -a production-$(date +%Y-%m-%d) -m "Production deployment"
git push origin production-$(date +%Y-%m-%d)
```

---

**Your Next Action:** Run the checklist above to create a backup before testing on your laptop! 🔒

---

*Created: January 7, 2026, 9:50 PM*
