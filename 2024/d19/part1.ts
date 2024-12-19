import { runMain, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";
import { memoize, pipe, } from '../func_util.ts';
import * as gu from "../grid_util.ts";

export type Color = "w"|"u"|"b"|"r"|"g"

// hacky, ignoring pieces, but might work
const canMakePattern = memoize(_canMakePattern, (t,_)=>t);

export function _canMakePattern(target:string, pieces:string[]):boolean {
    /// huh, this is more or less pathfinding again

    if(target.length === 0) return true;

    const validPrefixes = pieces.filter(p=>target.startsWith(p));

    if(validPrefixes.length === 0) return false;

    return validPrefixes.some(p=> canMakePattern(target.substring(p.length),pieces));
}

export function parseInput(lines:string[]) {
    const [towelsRaw, ...targets] = lines;

    const towels = towelsRaw.split(",").map(t=>t.trim());

    return {towels, targets};
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const values = parseInput(cleanedLines);

    console.log(values);

    const canMake = values.targets.map(tgt=>({tgt, canMake: canMakePattern(tgt, values.towels)}));

    console.log({canMake})

    const answer = sum(canMake, ({canMake})=> +canMake);


    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
