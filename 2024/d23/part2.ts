import { runMain, } from "../util.ts";
import { filter, reduce } from "../iter_util.ts";
import { parseInput } from './part1.ts';

function findLargestGroup(map: Map<string, string[]>):string[] {
    const newMap = new Map(map.entries().map(([k,vs])=>[k,new Set(vs)]))

    const [candidates,largestHubSize] = reduce(
        newMap.entries(),
        (acc,[key,vals])=>
            vals.size > acc[1] ? 
                [[key],vals.size] as typeof acc :
            vals.size === acc[1] ? 
                (acc[0].push(key),acc) :
            acc,
        [[],0] as [string[],number]);

    //console.log({candidates})

    const [startPoints,bestStartPointScore] = candidates.reduce((acc,cur)=>{
            const [accNodes, accScore] = acc;

            const curNeighbors = newMap.get(cur)!;
            const curScore = reduce(curNeighbors,
                                (acc,cur)=> acc + curNeighbors.intersection(newMap.get(cur)!).size
                                ,0);

            if(curScore > accScore)
                return [[cur],curScore] as typeof acc;
            else if(curScore === accScore)
                accNodes.push(cur);

            return acc;
    }, [[],0] as [string[],number]);

    const startPointSet = new Set(startPoints);
    let retVal = new Set<string>();

    for(const startPoint of startPointSet) {
        const cluster = new Set([startPoint]);

        const visited = new Set();

        const queue = [...newMap.get(startPoint)!];

        while(queue.length > 0) {
            const cur = queue.shift()!;
            visited.add(cur);
            
            const curNeighbors = newMap.get(cur)!

            if(cluster.isSubsetOf(curNeighbors)) {
                cluster.add(cur);
                queue.push(...filter(curNeighbors, n=>!visited.has(n)));

                startPointSet.delete(cur); // just in case
            }
        }

        if(cluster.size > retVal.size)
            retVal = cluster;

        console.log({retVal});
    }

    return [...retVal];
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const map = parseInput(cleanedLines);

    const party = findLargestGroup(map);

    const answer = party.toSorted().join(",");

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
