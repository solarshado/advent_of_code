import { runMain, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";

export type Foo = {
    TODO:unknown,
};

function hash(s:string): number {
    return s.split("").reduce((acc,cur)=> {
        acc += cur.charCodeAt(0);
        acc *= 17;
        acc %= 256;
        return acc;
    },0);
}

export async function main(lines:string[]) {
    //console.log(hash("HASH") === 52); return;

    const fullInput = lines.map(l=>l.trim()).filter(l=>l!='').join("");

    const steps = fullInput.split(",");

    const hashes = steps.map(s=>hash(s));

    console.log(hashes);

    const answer = sum(hashes);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
