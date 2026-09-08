# Security

Report vulnerabilities privately to the repository maintainer before public disclosure.

The Router stores no signing secret. Logs and health responses must not contain credentials. Production signing accepts only validated, canonical, domain-separated requests. `ExternalSigner` uses a bounded deadline and response body, strict response schemas, disabled redirects, and the same endpoint policy as preflight. Endpoint validation rejects credentials, non-HTTPS URLs and loopback/private/link-local/reserved DNS results by default; operators must still enforce egress controls and defend against DNS rebinding at the network layer.

Fixture providers, `EphemeralSigner`, and `allowPrivateEndpoints` are development facilities. FLOP runtime support is unavailable until an authoritative adapter can be implemented and exercised.
