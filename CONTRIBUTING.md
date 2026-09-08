# Contributing

Thank you for helping improve FLOP Session Router. This is a community-built, unofficial alpha project and not a FLOP Labs product.

## Before opening a change

- Keep contributions within the public Router scope. Do not add private control-plane, treasury, counterparty, wallet, operator, or production identity material.
- Never commit credentials, private keys, databases, telemetry dumps, real miner data, or generated secrets.
- Keep runtime and protocol claims evidence-based. Simulated candidates and unavailable integrations must remain clearly labelled.
- Open an issue before proposing a large architectural change. Focused fixes and tests can be submitted directly.

## Local verification

Use a supported Node.js version and run:

```sh
npm ci --ignore-scripts
npm run check
```

Pull requests should explain the behavior changed, security implications, tests performed, and any remaining alpha limitation. Required CI must stay deterministic and must not require live networks, wallets, identities, passphrases, or API keys.

Report security vulnerabilities through GitHub's private vulnerability reporting instead of a public issue.
