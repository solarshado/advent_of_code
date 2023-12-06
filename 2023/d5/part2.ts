import { linesFrom } from "../util.ts";
import { parseAlmanac, mapMultiStep } from './part1.ts';
import { range, concat, reduce, map } from '../iter_util.ts';

async function main() {
    const lines = (await linesFrom()).filter(l=>l!='');
    //const lines = example.split('\n');

    const {maps, seeds} = parseAlmanac(lines);

    //console.log(maps);
    //console.log(seeds);

    // performance is *slow as **fuck***.
    // reddit mentions using the ranges themselves as the input values to
    // *greatly* reduce the computations needed.
    //
    // interesting idea. not sure if I care enough to implement it yet.
    // but I'll try to keep it in mind if a future problem sounds like it
    // might benefit

    const seedRanges = seeds.reduce((acc,cur,i)=>{
        if(i%2 == 1) {
            acc.at(-1)!.push(cur);
        } else {
            acc.push([cur]);
        }
        return acc;
    },[] as number[][])
    .map(([s,l])=>range(s,l));

    const seeds2 = concat(...seedRanges);

    const results = map(seed=>({seed,location:mapMultiStep(seed,maps)}), seeds2);

    //console.log(results)
    const answer = reduce((l,r)=>Math.min(l,r.location),Number.POSITIVE_INFINITY,results);

    //console.log(Math.min(...results.map(r=>r.location)));
    console.log(answer);
}

if(import.meta.main)
    await main();
