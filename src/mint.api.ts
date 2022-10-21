import { MINT_SERVER } from ".";

const axios = require("axios").default;

export const mintApi = {
    requestMint: async function (amount: any) {
        const { data } = await axios.get(`${MINT_SERVER}/mint`, {
            params: {
                amount,
            },
        });
        return data;
    },
    mint: async function (payloads: any, paymentHash = "") {
        const { data } = await axios.post(`${MINT_SERVER}/mint`, payloads, {
            params: {
                payment_hash: paymentHash,
            },
        });
        return data;
    },

    getKeys: async function () {
        const { data } = await axios.get(`${MINT_SERVER}/keys`);
        return data;
    },
};
