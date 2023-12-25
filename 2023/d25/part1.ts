import { runMain, sum, } from "../util.ts";
import { count, filter, map, toArray } from "../iter_util.ts";
import { pipe } from "../func_util.ts";

export type Machine = {
    name:string,
    connections:Set<string>
}

export function parseInput(lines:string[]) {
    const links = lines.flatMap(line=>{
        const [name,connectionsRaw] = line.split(":").map(s=>s.trim());
        const connections = connectionsRaw.split(" ").map(s=>s.trim());

        return connections.map(con=>[name,con] as const);
    });

    const machines  = new Set(links.flat());

    return new Map<string,Machine>(map(machines.values(),machineName=> {
        return [
            machineName,
            {
                name: machineName,
                connections: new Set(
                    links.filter(l=>l.some(m=>m===machineName)).flat()
                    .filter(m=>m!==machineName))
            }
        ];
    }));
}

function noUndef<T>(o:T|undefined):o is T {
    return o !== undefined;
}

type ElementOf<T> =
    T extends Iterable<infer U> ? U :
    T extends Iterator<infer U> ? U : never

export function findCuts(network:Map<string,Machine>) {
    const targetCutCount = 3;

    console.log("findCuts: network size =",network.size);

    debugger;

    let rootCount = 0;
    for(const [startNodeName,startNode] of network.entries()){
        rootCount++;
        console.log("starting from",startNodeName,"-",rootCount,"/",network.size);

        const seen = new Set<string>([startNodeName]);

        const mkNext = (from:Machine)=>map(
            filter(from.connections, c=>!seen.has(c)),
            to=>({
                from: from.name,
                to,
                openLinkDelta: () => pipe(
                    network.get(to)!.connections,
                    c => filter(c, other => other !== from.name && !seen.has(other)),
                        count
                ) - 1,
        }));
        type Visitable = ElementOf<ReturnType<typeof mkNext>>;

        // far from the ideal data structure
        const toVisit:(Visitable|undefined)[] = toArray(mkNext(startNode));

        function clean(ary:typeof toVisit):void {
            for(let i = ary.length - 1; i >= 0; --i)
            while(i < ary.length && (ary[i] === undefined || seen.has(ary[i]!.to))) {
                debugger;
                ary.splice(i,1);
            }
        }

        while(toVisit.length > 0) {
            const openLinkCount = toVisit.length;

            if(openLinkCount === targetCutCount) {
                return {
                    cuts: toVisit.filter(noUndef).map(({from,to})=>({from,to})),
                    inside: seen.size,
                    total: network.size,
                };
            }

            // far from the ideal selection method
            const curLink = toVisit.shift()!;

            seen.add(curLink.to);

            const nextLinks = mkNext(network.get(curLink.to)!);

            toVisit.push(...nextLinks);

            clean(toVisit);
        }
    }
    throw "failed to find cuts"
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const machines = parseInput(cleanedLines);

    console.log(machines);

    const cutResult = findCuts(machines);
    console.log(cutResult);

    const answer = cutResult.inside * (machines.size - cutResult.inside);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
