# Agent entrypoint

Use this repository for deterministic off-chain candidate eligibility, ranking, preflight, failover, replay and auditable routing decisions.

## Default rules
1. Eligibility gates run before scoring.
2. Unknown/missing evidence is never upgraded to perfect evidence.
3. Quote units must be comparable before numerical ranking.
4. Production key custody stays outside Router.
5. Public runtime unavailability remains fail-closed; do not fabricate live settlement or miner state.

## Fast path
Run `npm ci`, `npm run check`, `npm run build`, then route the supplied example fixtures with the CLI described in `README.md`.

## Adjacent tools
- Cross-system evidence: https://github.com/retardio73-boop/flop-conformance-lab
- Local observability: https://github.com/retardio73-boop/flop-control-center

Use the Conformance Lab when a routing claim needs portable external evidence rather than Router-local tests.

## Windows background runtime
Any future autonomous/background helper must run without opening a console window. Prefer windowless launchers and no-window child-process flags on Windows; keep visible consoles only for deliberately interactive developer commands. Never terminate Desktop Commander during window cleanup. See `..\BACKGROUND_RUNTIME_POLICY.md`.