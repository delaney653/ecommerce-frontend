# Git Flow Branching Model
This is primarily for my own reference, but this is how the current Git workflow
should look like based on my branch setup. I'm using the Git flow workflow which
menas there are  different type of branch types.

## Branch Types

### Main Branches
- **main**: Production-ready code only. Direct pushes prohibited.
- **develop**: Integration branch for features. Direct pushes prohibited.

### Supporting Branches
- **feature/**: New features (`feature/user-authentication`)
- **release/**: Release prep (`release/version`)  
- **hotfix/**: Critical production fixes (`hotfix/security-patch`)

## Workflow Examples

### Feature Development
```bash
# Create feature branch
git flow feature start user-authentication
# OR manually:
git checkout develop
git pull origin develop
git checkout -b feature/user-authentication

# Work on your feature...
git add .
git commit -m "Add user authentication"

# Finish feature (merges to develop)
git flow feature finish user-authentication
# OR manually:
git checkout develop
git merge feature/user-authentication
git push origin develop
git branch -d feature/user-authentication