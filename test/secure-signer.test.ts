import test from "node:test";
import assert from "node:assert/strict";
import {
  SecureSignerBoundary,
  type Signer,
  type SignerIdentity,
  type ValidatedSignRequest,
  validateSignRequest,
} from "../src/index.js";

const identity: SignerIdentity = { type: "TEST", publicKey: "key-a" };
const other: SignerIdentity = { type: "TEST", publicKey: "key-b" };
const request = validateSignRequest("FLOP_ROUTER_SESSION_V1", "session", { id: "s1" });

class StubSigner implements Signer {
  constructor(
    private current: SignerIdentity,
    private resultIdentity: SignerIdentity = current,
    private fail = false,
  ) {}

  async getIdentity() {
    if (this.fail) throw new Error("OFFLINE");
    return this.current;
  }

  async sign(_request: ValidatedSignRequest) {
    if (this.fail) throw new Error("OFFLINE");
    return {
      identity: this.resultIdentity,
      signature: "sig",
      payloadHash: "sha256:" + "0".repeat(64),
    };
  }
}

test("secure boundary signs only for pinned identity and allowed scope", async () => {
  const signer = new SecureSignerBoundary(new StubSigner(identity), {
    expectedIdentity: identity,
    allowedScopes: [{ domain: "FLOP_ROUTER_SESSION_V1", kind: "session" }],
  });
  assert.deepEqual(await signer.getIdentity(), identity);
  assert.equal((await signer.sign(request)).identity.publicKey, identity.publicKey);
  assert.equal((await signer.health()).status, "READY");
});

test("secure boundary fails closed on identity mismatch", async () => {
  const signer = new SecureSignerBoundary(new StubSigner(other), {
    expectedIdentity: identity,
    allowedScopes: [{ domain: "FLOP_ROUTER_SESSION_V1", kind: "session" }],
  });
  await assert.rejects(() => signer.getIdentity(), /IDENTITY_MISMATCH/);
  assert.equal((await signer.health()).status, "IDENTITY_MISMATCH");
});

test("secure boundary rejects unapproved signing scopes", async () => {
  const signer = new SecureSignerBoundary(new StubSigner(identity), {
    expectedIdentity: identity,
    allowedScopes: [{ domain: "FLOP_ROUTER_DECISION_V1", kind: "decision" }],
  });
  await assert.rejects(() => signer.sign(request), /SCOPE_DENIED/);
});

test("secure boundary rejects identity drift across sign response", async () => {
  const signer = new SecureSignerBoundary(new StubSigner(identity, other), {
    expectedIdentity: identity,
    allowedScopes: [{ domain: "FLOP_ROUTER_SESSION_V1", kind: "session" }],
  });
  await assert.rejects(() => signer.sign(request), /IDENTITY_MISMATCH|IDENTITY_DRIFT/);
});

test("secure boundary reports signer unavailability without fallback", async () => {
  const signer = new SecureSignerBoundary(new StubSigner(identity, identity, true), {
    expectedIdentity: identity,
    allowedScopes: [{ domain: "FLOP_ROUTER_SESSION_V1", kind: "session" }],
  });
  assert.equal((await signer.health()).status, "UNAVAILABLE");
});
