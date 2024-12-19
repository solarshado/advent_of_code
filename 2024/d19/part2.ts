import { runMain, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";
import { memoize, pipe, } from '../func_util.ts';
import * as gu from "../grid_util.ts";
import { parseInput } from './part1.ts';

// hacky, ignoring pieces, but might work
export const countWaysToMakeTarget = memoize(_countWaysToMakeTarget, (t,_)=>t);

export function _countWaysToMakeTarget(target:string, pieces:string[]):number {

    if(target.length === 0) return 1; // ... there *is* only one empty set...

    const validPrefixes = pieces.filter(p=>target.startsWith(p));

    if(validPrefixes.length === 0) return 0;

    return sum(validPrefixes, p=>countWaysToMakeTarget(target.substring(p.length),pieces));
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const values = parseInput(cleanedLines);

    console.log(values);

    const counts = values.targets.map(tgt=>({tgt, count: countWaysToMakeTarget(tgt, values.towels)}));

    console.log({counts})

    const answer = sum(counts, ({count})=> +count);


    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
