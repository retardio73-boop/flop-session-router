---
name: flop-session-router
description: Deterministically evaluate and route FLOP-oriented compute-session candidates with hard eligibility gates, bounded preflight, failover and auditable decisions. Use for routing simulation and integration development; never infer unavailable live FLOP settlement or take productive key custody.
---

# FLOP Session Router

Use Router when an agent needs deterministic candidate evaluation, preflight, failover or replayable routing evidence.

## Rules
- Apply hard compatibility gates before scoring.
- Reject incomparable quote units instead of inventing conversions.
- Keep productive signing outside Router.
- Treat public runtime unavailability as unavailable, not as synthetic live state.
- Prefer Conformance Lab evidence when a routing boundary needs external reproducibility.
