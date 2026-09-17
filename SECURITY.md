# Security

Report vulnerabilities privately to the repository maintainer before public disclosure.

The Router stores no signing secret. Logs and health responses must not contain credentials. Production signing accepts only validated, canonical, domain-separated requests. `ExternalSigner` uses a bounded deadline and response body, strict response schemas, disabled redirects, and the same endpoint policy as preflight. Endpoint validation rejects credentials, non-HTTPS URLs and loopback/private/link-local/reserved DNS results by default; operators must still enforce egress controls and defend against DNS rebinding at the network layer.

Fixture providers, `EphemeralSigner`, and `allowPrivateEndpoints` are development facilities. FLOP runtime support is unavailable until an authoritative adapter can be implemented and exercised.

## Local inference gateway

The experimental inference gateway is intended for local development. It has no production authentication layer and binds to `127.0.0.1` by default. Do not expose it directly to an untrusted network. If remote access is required, place it behind an authenticated reverse proxy, enforce request/body limits and network policy, and treat model/provider credentials as deployment secrets.

GPU admission thresholds, process-name pauses, BelowNormal priority, and Ollama idle unloading are availability/resource protections, not security boundaries. Benchmark helpers intentionally create load and should remain operator-invoked.
