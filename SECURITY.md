# Security

Report vulnerabilities privately to the repository maintainer before public disclosure.

The Router stores no signing secret. Logs and health responses must not contain credentials. Production signing accepts only validated, canonical, domain-separated requests. Endpoint preflight rejects credentials, redirects, non-HTTPS URLs and private/reserved addresses by default; operators must still defend against DNS rebinding at the network layer.

Fixture providers, `EphemeralSigner`, and `allowPrivateEndpoints` are development facilities. FLOP runtime support is unavailable until an authoritative adapter can be implemented and exercised.
