import { runMain, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";
import { memoize, pipe, } from '../func_util.ts';
import { Rule, RULES } from './part1.ts';

function _applyOnce(n:number, rules:Rule[]=RULES):number[] {
        for(const {matches: test, apply} of rules)
            if(test(n)) {
                const ret = apply(n);
                return Array.isArray(ret) ? ret : [ret];
            }
        throw "no matching rule";
}

const applyOnce = memoize(_applyOnce);


/// recursive, depth first?
function applyRules(input:number[]):number {
    const MAX_DEPTH = 75;

    const inner = memoize(_inner);

    function _inner(input:number, depth=0):number {
        const out = _applyOnce(input);
        console.log("in inner",{input, out, depth});
        if(depth == MAX_DEPTH)
            return out.length;

        return sum([...map(out,v=>inner(v,depth+1))]);
    }

    return sum([...map(input,v=>inner(v,1))]);
}

// need to detect patterns in the process so we can skip ahead
// there's no interdependency...

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const values = cleanedLines[0].split(" ").map(Number);

    console.log(values);

    const answer = applyRules(values);

    /// for each individual input, run the algo to completion (call apply 75 times)
    // but will that work for even onw

    //const answer = sum(values.map(v=>{
    //    let vs = [v];
    //    let blinks = 0;
    //    while(true) {
    //        console.log({blinks});
    //        vs = applyRules(vs);
    //        if(++blinks == 75)
    //            break;
    //    }
    //
    //    return vs.length;
    //}));
    //
    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
