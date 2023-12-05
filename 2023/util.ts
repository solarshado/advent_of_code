import { readStringDelim } from "https://deno.land/std@0.105.0/io/mod.ts";

export async function linesFrom(source:Deno.Reader = Deno.stdin):Promise<string[]> {
    const ret = [];
    const reader = readStringDelim(source, '\n');

    for await (const line of reader) {
        ret.push(line);
    }

    return ret;
}

export function sum<T=number>(nums:T[], mapper?:((v:T)=>number)):number {
    const reducer:(acc:number,curr:T)=>number =
        typeof mapper === "function" ?
        (acc,curr)=> acc + mapper(curr) :
        (acc,curr)=> acc + +curr;

    return nums.reduce(reducer,0);
}
