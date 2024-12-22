import { runMain, } from "../util.ts";
import { range } from "../iter_util.ts";

export const ITERATIONS = 2000;

export function nextSecret(secret:bigint):bigint {
    secret = prune(mix(secret * 64n,secret));

    // JS bitint division truncated towards zero... so shenanigans are needed here
    //secret = prune(mix(BigInt(Math.round(Number(secret) / 32)), secret))
    // "round towards zero" ... as long as we're >0, that's the same as truncating
    secret = prune(mix(secret / 32n, secret));

    secret = prune(mix(secret * 2048n,secret));

    return secret;
}

function mix(mixin:bigint, secret:bigint) {
    return mixin ^ secret;
}

const PRUNE_MODULO = 16777216n;
function prune(secret:bigint, modulo=PRUNE_MODULO) {
    return secret % modulo;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    let values = cleanedLines.map(BigInt);

    console.log(values);

    for(const _ of range(0,ITERATIONS))
        values = values.map(nextSecret);

    console.log(values);

    const answer = values.reduce((l,r)=>l+r);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
