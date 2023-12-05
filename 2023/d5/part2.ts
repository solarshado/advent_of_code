import { linesFrom, sum } from "../util.ts";
import { parseAlmanac, mapMultiStep, example } from './part1.ts';

/*
const example = `
`.trim();
*/

async function main() {
    const lines = (await linesFrom()).filter(l=>l!='');
    //const lines = example.split('\n');

    const {maps, seeds} = parseAlmanac(lines);

    //console.log(maps);
    //console.log(seeds);

    function* range(start:number, length:number) {
        for(let n = start; n < start+length; ++n)
            yield n;
    }

    function* concat<T>(...iters:Iterable<T>[]) {
        for(const iter of iters)
            yield* iter;
    }

    function* map<T,U>(mapper:(item:T)=>U, iter:Iterable<T>) {
        for(const item of iter)
            yield mapper(item);
    }

    function reduce<T,U>(reducer:(acc:T,cur:U)=>T, seed:T, iter:Iterable<U>) {
        let acc = seed
        for(const item of iter)
            acc = reducer(acc,item);

        return acc;
    }

    //TODO? memoize something to speedup the path calculations?

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
