# Contributing

Thank you for helping improve FLOP Session Router. This is a community-built, unofficial alpha project and not a FLOP Labs product.

## Before opening a change

- Keep contributions within the public Router scope. Do not add private control-plane, treasury, counterparty, wallet, operator, or production identity material.
- Never commit credentials, private keys, databases, telemetry dumps, real miner data, or generated secrets.
- Keep runtime and protocol claims evidence-based. Simulated candidates and unavailable integrations must remain clearly labelled.
- Open an issue before proposing a large architectural change. Focused fixes and tests can be submitted directly.

## Evidence gate

New Router behavior should answer a demonstrated routing problem, not create a generic platform in anticipation of one. A feature should normally satisfy at least one of these:

- reproduce a real or upstream-discussed routing failure such as incompatible quote units, stale capability data, preflight failure, failover or replay divergence;
- consume a released/pinned FLOP or interoperability interface that has an actual current caller;
- remove a measured operational blocker in candidate selection, preflight, persistence, recovery, signing boundaries or auditable decision output;
- provide a narrowly scoped adapter needed by the Conformance Lab or another concrete integration.

Do not add speculative reputation systems, treasury/wallet logic, generic agent orchestration, global monitoring, market intelligence, autonomous strategy layers or placeholder protocol adapters to Router core. Experiments can be explored separately and promoted only when they produce a concrete consumer and a deterministic regression or acceptance criterion.

## Local verification

Use a supported Node.js version and run:

```sh
npm ci --ignore-scripts
npm run check
```

Pull requests should explain the behavior changed, security implications, tests performed, and any remaining alpha limitation. Required CI must stay deterministic and must not require live networks, wallets, identities, passphrases, or API keys.

Report security vulnerabilities through GitHub's private vulnerability reporting instead of a public issue.
