# Publication status

This file distinguishes repository/package state, Git tag state, and GitHub Release state so public documentation does not imply that an unpublished asset already exists.

## Current repository state

- Package metadata: `0.1.2`.
- `main` passes the full local check suite, including Windows package smoke.
- Public tag `v0.1.2-alpha` exists on the tested release commit.
- Local release artifact `flop-tools-session-router-0.1.2.tgz` and `SHA256SUMS` were generated from that tested tree.
- A GitHub Release entry with attached assets is still pending.

Therefore `v0.1.2-alpha` is a **tagged repository/package release candidate pending GitHub Release asset publication**. Do not describe it as a downloadable GitHub Release until the release entry and matching assets are present.

## Publication acceptance gate

A version may be described as a published GitHub Release only after all of the following exist for the same immutable commit:

- package version;
- passing CI/check suite;
- release tag;
- GitHub Release entry;
- packaged artifact(s);
- SHA-256 checksum manifest;
- protocol compatibility manifest or equivalent pinned evidence where applicable.

Until then, use `tagged repository/package state` or `pending GitHub Release asset publication` rather than `published GitHub Release`.
