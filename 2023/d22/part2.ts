import { runMain, sum, } from "../util.ts";
import { every, } from "../iter_util.ts";
import { Brick, dropBricks, groupByLowestPoint, parseInput } from './part1.ts';

import { PriorityQueue } from "../d17/part1.ts";

export function countWouldFallOnDisentigrate(bricks:Brick[]):number {
    const grouped = groupByLowestPoint(bricks)

    const supportedByMap = new Map<Brick,Set<Brick>>();
    const supportsMap = new Map<Brick,Set<Brick>>()

    console.log("building support trees");

    for(const bricks of grouped) {
        if(!bricks) continue;
        for(const cur of bricks) {
            const top = cur.getHighestPoint().z
            const toCheck = grouped.filter((g,i)=> i>top && g!==null && g!==undefined).flat();

            for(const above of toCheck) {
                if(!cur.isSupporting(above))
                    continue;

                if(!supportedByMap.has(above))
                    supportedByMap.set(above,new Set([cur]));
                else
                    supportedByMap.get(above)!.add(cur);

                if(!supportsMap.has(cur))
                    supportsMap.set(cur,new Set([above]));
                else
                    supportsMap.get(cur)!.add(above);
            }
        }
    }

    console.log("done")
    console.log("finding candidates...")

    const worthConsidering = bricks.filter(b=>{
        const supports = supportsMap.get(b);
        if(supports === undefined ||
           every(supports, child=>supportedByMap.get(child)!.size > 1))
            return false;

        return true;
    });

    console.log(worthConsidering.length, "candidates, determining results");


    // will likley need a memoized getResultsOfFall(Brick):{alsoFalling:Brick[], addToQueue:Brick[]}
    // or not. settling was much slower than any of this

    const numFalls = worthConsidering.map((yeeten,i)=>{

        if(i%100==0) {
            console.log("examining candidate",i,"of",worthConsidering.length);
        }

        const fallen = new Set<Brick>();

        fallen.add(yeeten);

        // plz don't let me down, shitty prio queue
        const toCheck = new PriorityQueue<Brick>(b=>b.getLowestPoint().z, supportsMap.get(yeeten)!)

        while(toCheck.length > 0) {
            const cur = toCheck.popFirst()!;

            const supporters = supportedByMap.get(cur)!;

            if(supporters.size <= 1 || every(supporters, s=>fallen.has(s))) {
                fallen.add(cur);

                const supported = supportsMap.get(cur)
                if(supported)
                    supported.forEach(b=>toCheck.add(b));
            }
        }

        console.log("candidate done,",fallen.size-1,"fallen")

        return fallen.size - 1
    });

    return sum(numFalls);
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const bricks = parseInput(cleanedLines)

    console.log("loaded",bricks.length,"bricks");

    const settled = dropBricks(bricks);

    console.log("bricks settled");

    const safeToDis = countWouldFallOnDisentigrate(settled);

    const answer = safeToDis;

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
