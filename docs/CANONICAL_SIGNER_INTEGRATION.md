# Canonical signer integration

Router intentionally keeps key custody outside the project. A production deployment should bind `ExternalSigner` to one canonical identity and treat signer reachability as runtime health, not as an identity-selection mechanism.

## Deployment invariants

- configure exactly one expected production identity outside Router core;
- verify the external signer identity before accepting signed Router output;
- never create, rotate to, or silently substitute another identity because the signer is temporarily unreachable;
- never fall back from the production signer to `EphemeralSigner` or `SecretInjectedSigner` automatically;
- require explicit opt-in for private/local signer endpoints;
- fail closed on signer timeout, malformed response, payload-hash mismatch or identity mismatch;
- keep passphrase/key custody outside Router;
- after restart, prove that the same expected identity signs a domain-separated Router challenge before declaring the deployment ready.

## Stack closure contract

For the FLOP / Technocore deployment that uses this Router, signer closure requires:

1. the external signer resolves to the canonical DID selected by the deployment;
2. a Router session or decision payload is canonicalized and signed through the external boundary;
3. the returned payload hash matches Router's local hash;
4. the signature verifies against the canonical identity at the deployment boundary;
5. restart/recovery restores access to the same signer without human interaction;
6. signer loss produces an explicit unavailable/failed health state and never triggers another DID.

Router remains identity-agnostic as a reusable project; identity pinning belongs to the deployment adapter. The public Router repository must therefore not hard-code a builder DID into generic routing logic.
