# Secure signer boundary

`SecureSignerBoundary` is a deployment-facing wrapper for any Router `Signer`. It does not hold or recover private keys. Its job is to enforce identity continuity and signing policy before Router accepts signatures from a local or remote custody implementation.

## Guarantees

- one expected signer identity is pinned by the deployment;
- every signing request must match an explicit domain/kind scope;
- identity is checked before signing and again on the returned signature result;
- identity substitution or drift fails closed;
- signer loss is reported as unavailable and never triggers fallback to another key;
- Router core remains independent of DPAPI, TPM, HSM, keyring or remote-signer custody details.

## Intended composition

```text
Router -> SecureSignerBoundary -> Signer adapter -> custody backend
```

Examples of custody backends include a Windows CurrentUser/DPAPI process, TPM/HSM service, hardware-backed signer, OS keyring adapter or authenticated remote signer. Those backends remain outside this repository unless they can be implemented without embedding deployment secrets or machine-specific configuration.

## Example

```ts
const signer = new SecureSignerBoundary(externalSigner, {
  expectedIdentity: { type: "ed25519", publicKey: process.env.EXPECTED_PUBLIC_KEY! },
  allowedScopes: [
    { domain: "FLOP_ROUTER_SESSION_V1", kind: "session" },
    { domain: "FLOP_ROUTER_DECISION_V1", kind: "decision" },
  ],
});
```

The expected identity must come from trusted deployment configuration. Do not learn or rotate it automatically from whichever signer happens to answer first.

## Non-goals

This feature does not publish a production key, DPAPI blob, pipe name, ACL, token, recovery artifact, passphrase flow, private-key export path or machine-specific signer configuration. It standardizes the boundary around those implementations rather than exposing them.
