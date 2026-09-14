import type {
  Signer,
  SignerIdentity,
  SignResult,
  SigningDomain,
  ValidatedSignRequest,
} from "./signer.js";

export interface SignerScope {
  domain: SigningDomain;
  kind: ValidatedSignRequest["kind"];
}

export interface SecureSignerBoundaryOptions {
  expectedIdentity: SignerIdentity;
  allowedScopes: readonly SignerScope[];
}

export type SecureSignerHealth =
  | { status: "READY"; identity: SignerIdentity }
  | { status: "IDENTITY_MISMATCH"; reason: string }
  | { status: "UNAVAILABLE"; reason: string };

function sameIdentity(left: SignerIdentity, right: SignerIdentity): boolean {
  return left.type === right.type && left.publicKey === right.publicKey;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "SIGNER_UNAVAILABLE";
}

export class SecureSignerBoundary implements Signer {
  constructor(
    private readonly inner: Signer,
    private readonly options: SecureSignerBoundaryOptions,
  ) {
    if (!options.expectedIdentity.type || !options.expectedIdentity.publicKey) {
      throw new Error("SIGNER_EXPECTED_IDENTITY_REQUIRED");
    }
    if (options.allowedScopes.length === 0) {
      throw new Error("SIGNER_SCOPE_REQUIRED");
    }
  }

  private assertIdentity(identity: SignerIdentity): void {
    if (!sameIdentity(identity, this.options.expectedIdentity)) {
      throw new Error("SIGNER_IDENTITY_MISMATCH");
    }
  }

  private assertScope(request: ValidatedSignRequest): void {
    const allowed = this.options.allowedScopes.some(
      (scope) => scope.domain === request.domain && scope.kind === request.kind,
    );
    if (!allowed) throw new Error("SIGNER_SCOPE_DENIED");
  }

  async getIdentity(): Promise<SignerIdentity> {
    const identity = await this.inner.getIdentity();
    this.assertIdentity(identity);
    return identity;
  }

  async sign(request: ValidatedSignRequest): Promise<SignResult> {
    this.assertScope(request);
    const before = await this.getIdentity();
    const result = await this.inner.sign(request);
    this.assertIdentity(result.identity);
    if (!sameIdentity(before, result.identity)) {
      throw new Error("SIGNER_IDENTITY_DRIFT");
    }
    return result;
  }

  async health(): Promise<SecureSignerHealth> {
    try {
      return { status: "READY", identity: await this.getIdentity() };
    } catch (error) {
      const reason = errorMessage(error);
      if (reason === "SIGNER_IDENTITY_MISMATCH") {
        return { status: "IDENTITY_MISMATCH", reason };
      }
      return { status: "UNAVAILABLE", reason };
    }
  }
}
