import { runMain, } from "../util.ts";
import { pipe, } from '../func_util.ts';

export function parseInput(lines:string[]) {
    const pairs = lines.map(l=>l.split("-"));

    const retVal = new Map<string,string[]>();

    for(const [l,r] of pairs) {
        if(!retVal.has(l))
            retVal.set(l,[]);
        if(!retVal.has(r))
            retVal.set(r,[]);

        retVal.get(l)!.push(r);
        retVal.get(r)!.push(l);
    }

    return retVal;
}

export function findLoopsOfThree(map:Map<string,string[]>) {
    const loops = [];

    for(const [k,vs] of map.entries()) {
        if(!k.startsWith("t"))
            continue;
        
        const seen = new Set<string>();

        for(const neighbor of vs) {
            seen.add(neighbor);

            for(const n2 of map.get(neighbor)!) {
                // prevent duplicate reversed loops
                // doesn't catch all possible dupes :(
                if(seen.has(n2))
                    continue;

                if(map.get(n2)!.includes(k))
                    loops.push([k,neighbor,n2] as const);
            }
        }
    }

    const retVal = pipe(
        loops.map(l=>l.toSorted().join(",")),
        ls=>new Set(ls),
        ls=>[...ls].map(l=>l.split(",") as [string,string,string])
    );

    return retVal;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const map = parseInput(cleanedLines);

    const loops = findLoopsOfThree(map);

    //console.log({map,loops,loopCount:loops.length});

    const answer = loops.length;

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
