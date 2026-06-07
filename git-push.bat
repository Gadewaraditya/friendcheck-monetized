@echo off
cd /d "%~dp0"
echo Removing lock files...
del /f ".git\index.lock" 2>nul
del /f ".git\HEAD.lock" 2>nul
echo Staging all changes...
git add -A
echo Committing...
git commit -m "fix: update all domain refs friendship-check.in to friendship-hub.fun + add OG images"
echo Pushing to GitHub...
git push origin main
echo.
echo Done! Press any key to close.
pause
