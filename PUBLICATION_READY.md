# Publication readiness

Status: `DESKTOP_INTERACTIVE_AUTH_REQUIRED`

The repository is prepared for a GitHub public alpha. No productive DID, wallet, passphrase, npm token or signing key is needed. npm publication remains `NPM_PUBLICATION_PENDING_SCOPE_OWNERSHIP`.

From this repository, after installing GitHub CLI and authenticating it while physically present:

```powershell
gh auth status
.\scripts\publish-github.ps1 -Owner YOUR_EXISTING_GITHUB_ACCOUNT_OR_ORG
```

The script refuses absent authentication, a dirty worktree, a conflicting remote, or a pre-existing non-empty repository that was not already configured as `origin`. It runs frozen install, all checks, package smoke, creates fresh artifacts and checksums, pushes `main`, creates `v0.1.0-alpha`, and verifies public visibility.

Do not create the repository under `flop-labs`. Do not publish the npm package until ownership of `@flop-tools` is independently verified.
