// TODO: Once @xocash/json-payment-protocol-v2 is released, consider replacing this file with that package.

import {
  binsAreEqual,
  hexToBin,
  secp256k1,
  sha256,
  utf8ToBin,
} from "@bitauth/libauth";

export type TrustedKeys = {
  [identity: string]: {
    owner: string;
    expirationDate: string;
    domains: Array<string>;
    publicKeys: Array<string>;
  };
};

export interface PaymentOptionsResponse {
  time: string; // ISO date string
  expires: string; // ISO date string
  memo: string;
  paymentUrl: string;
  paymentId: string;
  paymentOptions: Array<{
    chain: string;
    currency: string;
    network: string;
    estimatedAmount: number;
    requiredFeeRate: number;
    minerFee: number;
    decimals: number;
    selected: boolean;
  }>;
}

export interface PaymentRequestBody {
  chain: string;
  currency?: string;
}

export interface PaymentRequestResponse {
  time: string; // ISO date string
  expires: string; // ISO date string
  memo: string;
  paymentUrl: string;
  paymentId: string;
  chain: string;
  network: string;
  instructions: Array<{
    type: string;
    requiredFeeRate?: number;
    outputs: Array<{
      amount: number;
      address: string;
    }>;
  }>;
}

export interface PaymentVerificationBody {
  chain: string;
  transactions: Array<{
    tx: string;
  }>;
  currency: string;
}

export interface PaymentBody {
  chain: string;
  transactions: Array<{
    tx: string;
  }>;
}

export interface PaymentResponse {
  memo: string;
  transactions: Array<{
    tx: string;
  }>;
}

// These are fetched from https://bitpay.com/signingKeys/paymentProtocol.json
// Note that the expiration date is 2018, so I'm not sure wallets would even be using these anymore.
export const DEFAULT_TRUSTED_KEYS: TrustedKeys = {
  mh65MN7drqmwpCRZcEeBEE9ceQCQ95HtZc: {
    owner: "BitPay, Inc.",
    expirationDate: "2018-12-04T00:00:00.000Z",
    domains: ["test.bitpay.com"],
    publicKeys: [
      "03159069584176096f1c89763488b94dbc8d5e1fa7bf91f50b42f4befe4e45295a",
      "03de8bc75ff1fd82133dd1777fa08449032d4a7ac58c234545ffb7da38bc94aea1",
    ],
  },
  "1DbY94wCcLRM1Y6RGFg457JyqBbsYxzfiN": {
    owner: "BitPay, Inc.",
    expirationDate: "2018-12-03T00:00:00.000Z",
    domains: ["bitpay.com"],
    publicKeys: [
      "03218884b9a42334195ec32344d487ef291fda4b6e712a7858e9836c2d326e0c08",
      "027ffb2cc626a97bc3b449ae3b28b0acf07bc900bba8912d60ca12ad2b616cbe72",
      "03a29de86e138106a329bc6db085f02d8e19f59249204dfd5cc797fcb36b8ed93c",
      "022ba5469ec10a1d12911a5ca39c45bd0de24db83145507ffaf1fb6a3ca047f717",
      "03065b167ac14111efdbf7708708ecf44d22ed0e97af3c656a183162dabf5a59bf",
      "03dc0f18eadf553705ab87421d264204a9fcb8a7984997e07a867cbf55972908eb",
      "02cab72d4d5d0c9ede7617562e42c485dcfb34db52fd0e6a3de62462040ac1ce90",
      "02e184ad56dee82bbaf290144f24b7ab8e508f6c26e9181c8501c8219a7e1999b1",
      "027b7d555a3444936ddb200ca640f41aa8c89851fbbb13521b5aaa32d75df57cc8",
      "03c3872f9c42c1c2fca77a77727f3b180cdc811754f6b560d298f1ce63c78df484",
      "02527a9029fbb09ec9a02471e03296932d20544d3935fa492e2f74a1f79a0c48f6",
      "03adbd79e63b046cc25c70b2c1f428a410e1ca46f88fb6c387f2883090b9fa0367",
      "02c9f1fbf8afa5a9b6a22a6c442b184e7e72a8b173c4a06beb11a5b700f024b06e",
      "0386126eaa4f7bc816ea0c5841cdd1086704167c126e03c17dbd5fc899469091bb",
      "03271e4ea488ed0d1294dce6f3554c5d6f9cb068a847f500f2ea392148402499f1",
    ],
  },
};

export class JppV2Client {
  constructor(
    public opts: {
      verifySignatures: boolean;
      allowUnknownIdentities: boolean;
    } = {
      verifySignatures: false,
      allowUnknownIdentities: true,
    },
    public trustedKeys: TrustedKeys = DEFAULT_TRUSTED_KEYS
  ) {}

  async paymentOptions(url: string): Promise<PaymentOptionsResponse> {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/payment-options",
        "x-paypro-version": "2",
      },
    });

    if (!response.ok) {
      throw new Error(`${(await response.text()) || response.status}`);
    }

    const responseRaw = await response.text();

    if (this.opts.verifySignatures) {
      this.verifyResponseSignature(url, responseRaw, response.headers);
    }

    return JSON.parse(responseRaw);
  }

  async paymentRequest(
    url: string,
    body: PaymentRequestBody = {
      chain: "BCH",
      currency: "BCH",
    }
  ): Promise<PaymentRequestResponse> {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/payment-request",
        "x-paypro-version": "2",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`${(await response.text()) || response.status}`);
    }

    const responseRaw = await response.text();

    if (this.opts.verifySignatures) {
      this.verifyResponseSignature(url, responseRaw, response.headers);
    }

    return JSON.parse(responseRaw);
  }

  async paymentVerifcation(
    url: string,
    body: PaymentVerificationBody
  ): Promise<void> {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/payment",
        "x-paypro-version": "2",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`${(await response.text()) || response.status}`);
    }

    const responseRaw = await response.text();

    if (this.opts.verifySignatures) {
      this.verifyResponseSignature(url, responseRaw, response.headers);
    }

    return JSON.parse(responseRaw);
  }

  async payment(url: string, body: PaymentBody): Promise<PaymentResponse> {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/payment",
        "x-paypro-version": "2",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`${(await response.text()) || response.status}`);
    }

    const responseRaw = await response.text();

    if (this.opts.verifySignatures) {
      this.verifyResponseSignature(url, responseRaw, response.headers);
    }

    return JSON.parse(responseRaw);
  }

  protected verifyResponseSignature(
    url: string,
    rawBody: string,
    headers: Headers
  ): void {
    // Parse the URL so we can extract the hostname.
    const parsedUrl = new URL(url);
    const { hostname } = parsedUrl;

    // Extract necessary headers.
    const digest = headers.get("digest");
    const signature = headers.get("signature");
    const signatureType = headers.get("x-signature-type");
    const identity = headers.get("x-identity");

    // Ensure that expected hash was provided.
    if (typeof digest !== "string" || !digest) {
      throw new Error("Invalid digest header provided");
    }

    // Ensure that an identity was provided.
    if (typeof identity !== "string" || !identity) {
      throw new Error("Invalid identity header provided.");
    }

    // Ensure that a signature was provided.
    if (typeof signature !== "string" || !signature) {
      throw new Error("Invalid signature header provided.");
    }

    // Ensure that signature type is "ecc".
    if (typeof signatureType !== "string" || signatureType !== "ecc") {
      throw new Error(
        `Unsupported signature type "${signatureType}" (must be "ecc")`
      );
    }

    // Split the digest into type and content.
    const [digestType, digestHash] = digest.split("=");

    // Ensure that digest type is SHA-256.
    if (digestType !== "SHA-256") {
      throw new Error(
        `Unsupported Digest Type (${digestType}). Must be "SHA-256"`
      );
    }

    // Ensure that digest is present.
    if (!digestHash) {
      throw new Error("Invalid digest header. Must be of form SHA-256=hash");
    }

    // Try to find a key for this identity in our trusted keys.
    const keyData = this.trustedKeys[identity];

    // If we could not find a key...
    if (!keyData) {
      // And we do not allow unknown entities, throw an error.
      if (!this.opts.allowUnknownIdentities) {
        throw new Error(`No keys available for identity "${identity}"`);
      }

      // Compile all our known domains into a single array.
      const domains = Object.values(this.trustedKeys).flatMap(
        (entry) => entry.domains
      );

      // If this hostname is contained in our known domains, throw an error.
      if (domains.includes(hostname)) {
        throw new Error(
          `"${hostname}" has a trusted key, but it belongs to another identity`
        );
      }

      // Otherwise, just return.
      return;
    }

    // Ensure that the domain is whitelisted for this identity.
    if (!keyData.domains.includes(hostname)) {
      throw new Error(
        `${hostname} is not included in this identity's trusted domains`
      );
    }

    // Calculate the hash of the body.
    const actualHash = sha256.hash(utf8ToBin(rawBody));

    // Ensure the actual hash matches the expected hash.
    if (!binsAreEqual(actualHash, hexToBin(digestHash))) {
      throw new Error("Provided digest does not match actual digest");
    }

    // Iterate through each of the whitelisted public keys and see if any of them can match the expected signature.
    const didVerifySuccessfully = keyData.publicKeys.some((publicKey) => {
      return secp256k1.verifySignatureCompact(
        hexToBin(signature),
        hexToBin(publicKey),
        actualHash
      );
    });

    // If none of the public keys can verify the signature, throw an error.
    if (!didVerifySuccessfully) {
      throw new Error(
        `Failed to verify the signature against any of the identity's (${identity}) listed public keys`
      );
    }
  }
}
