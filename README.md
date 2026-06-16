
Canvasflow
==========

Quick setup
-----------

1. Copy `backend/.env.example` to `backend/.env` and fill in secrets.
2. Make sure `backend/.venv` and `backend/.env` are not committed (see `.gitignore`).

GitHub safety
-------------

- Never commit real secrets. Keep `backend/.env` local and add secrets to GitHub Actions/Secrets if needed.
- If you accidentally committed `backend/.env`, remove it from the repo with:

```powershell
git rm --cached backend/.env
git commit -m "Remove backend .env from repo"
git push
```

For history cleanup (only if the secret was pushed and must be removed from history), consider using `git filter-repo` or `git filter-branch` — follow official docs carefully.
