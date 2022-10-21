import { mintApi } from "./mint.api";
import { Wallet } from "./wallet";

const MINT_HOST = "127.0.0.1";
const MINT_PORT = 3338;
export const MINT_SERVER = `http://${MINT_HOST}:${MINT_PORT}`;

let keys = [];
async function run() {
    keys = await mintApi.getKeys();
    const wallet = new Wallet(keys);
    const command = process.argv[2];
    switch (command) {
        case "mint":
            const amount = +process.argv[3];
            const hash = process.argv[4];
            const resp = await wallet.mint(amount, hash);
            console.log(`mint\n`, resp);
            break;
        default:
            console.log(`Command '${command}' not supported`);
            break;
    }
}

try {
    run();
} catch (error) {
    console.log(error);
}
