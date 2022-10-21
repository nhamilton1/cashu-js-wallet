import { utils, Point } from "@noble/secp256k1";
import { step1Bob, step3Bob } from "./dhke";
import { mintApi } from "./mint.api";
import { splitAmount, bytesToNumber, bigIntStringify } from "./utils";

export class Wallet {
  keys: any;
  constructor(keys: any) {
    this.keys = keys;
  }

  async mint(amount: number, hash: string) {
    try {
      if (!amount || !Number.isInteger(amount)) {
        console.log("amount value missing");
        return;
      }
      if (hash) {
        const amounts = splitAmount(amount);
        const proofs = await this.requestTokens(amounts, hash);
        return proofs;
      }
      const invoice = await this.requestMint(amount);
      return invoice;
    } catch (error) {
      console.log("Failed to execute 'mint' command");
      console.error(error);
    }
  }

  async requestMint(amount: any) {
    const invoice = await mintApi.requestMint(amount);
    return invoice;
  }

  async requestTokens(
    amounts: string | any[],
    paymentHash: string | undefined
  ) {
    const payloads: {
      blinded_messages: any[];
    } = { blinded_messages: [] };
    const secrets = [];
    const randomBlindingFactors = [];
    for (let i = 0; i < amounts.length; i++) {
      const secret = bytesToNumber(utils.randomBytes(32)) + "";
      secrets.push(secret);
      const { B_, randomBlindingFactor } = await step1Bob(secret);
      randomBlindingFactors.push(randomBlindingFactor);
      payloads.blinded_messages.push({ amount: amounts[i], B_: B_ });
    }
    const payloadsJson = JSON.parse(
      JSON.stringify({ payloads }, bigIntStringify)
    );
    const promises = await mintApi.mint(payloadsJson.payloads, paymentHash);
    if (promises.error) {
      throw new Error(promises.error);
    }
    return this._constructProofs(promises, randomBlindingFactors, secrets);
  }

  _constructProofs(
    promises: any[],
    randomBlindingFactors: any[],
    secrets: string[]
  ) {
    return promises.map((p, i) => {
      const C_ = Point.fromHex(p["C_"]);
      const A = this.keys[p.amount];
      const C = step3Bob(
        C_,
        randomBlindingFactors[i],
        Point.fromHex(A)
      ).toHex();
      return {
        amount: p.amount,
        C: { C, secret: secrets[i] },
      };
    });
  }
}
