import { runMain, sum, } from "../util.ts";
import { map } from "../iter_util.ts";
import { memoize, } from '../func_util.ts';
import { Rule, RULES } from './part1.ts';

function _applyOnce(n:number, rules:Rule[]=RULES):number[] {
        for(const {matches: test, apply} of rules)
            if(test(n)) {
                const ret = apply(n);
                return Array.isArray(ret) ? ret : [ret];
            }
        throw "no matching rule";
}

function applyRules(input:number[]):number {
    const MAX_DEPTH = 75;

    const inner = memoize(_inner);

    function _inner(input:number, depth=0):number {
        const out = _applyOnce(input);
        //console.log("in inner",{input, out, depth});
        if(depth == MAX_DEPTH)
            return out.length;

        return sum([...map(out,v=>inner(v,depth+1))]);
    }

    return sum([...map(input,v=>inner(v,1))]);
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const values = cleanedLines[0].split(" ").map(Number);

    console.log(values);

    const answer = applyRules(values);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
