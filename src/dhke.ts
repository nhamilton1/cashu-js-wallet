import { Point, utils } from "@noble/secp256k1";
import { bytesToNumber } from "./utils";

async function hashToCurve(secretMessage: string) {
    let point;
    while (!point) {
        const hash = await utils.sha256(Buffer.from(secretMessage));
        try {
            point = Point.fromHex(hash);
        } catch (error) {
            const x = bytesToNumber(hash) + "";
            const msg = await utils.sha256(Buffer.from(x));
            secretMessage = utils.bytesToHex(msg);
        }
    }
    return point;
}

export async function step1Bob(secretMessage: string) {
    const Y = await hashToCurve(secretMessage);
    const randomBlindingFactor = bytesToNumber(utils.randomPrivateKey());
    const P = Point.fromPrivateKey(randomBlindingFactor);
    const B_ = Y.add(P);
    return { B_, randomBlindingFactor };
}

export function step3Bob(C_: Point, r: any, A: Point) {
    const C = C_.subtract(A.multiply(r));
    return C;
}
