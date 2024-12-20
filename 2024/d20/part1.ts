import { runMain, sum, } from "../util.ts";
import { count, map, toArray } from "../iter_util.ts";
import { memoize, pipe, } from '../func_util.ts';
import * as gu from "../grid_util.ts";

export type Tile = "#"|"."|"S"|"E";

export type Grid = gu.Grid<Tile>;

export type CostMap = Map<gu.Point,number>;
export type CheatPath = {start:gu.Point, end:gu.Point, saving:number};



export function buildCostMap(grid:Grid, startLoc:gu.Point, endLoc:gu.Point):CostMap {
    startLoc = gu.getPointMultiton(startLoc)

    const retVal = new Map<gu.Point,number>();
    retVal.set(startLoc, 1);

    const toVisit = [ startLoc ];

    while(toVisit.length > 0) {
        const cur = toVisit.shift()!;
        const curCost = retVal.get(cur)!;

        //console.log({cur,toVisit});

        const neighbors =
            gu.getManhattanNeighborhood(cur)
            .map(n=>gu.getPointMultiton(n)).filter(p=>
                                                    !retVal.has(p) &&
                                                    gu.isPointOnGrid(p, grid) &&
                                                    gu.getTileFrom(grid,p) === ".");
        for(const n of neighbors)
            retVal.set(n,curCost+1);

        toVisit.push(...neighbors);
    }

    return retVal;
}

export function findShortcuts(grid:Grid, costMap:CostMap):CheatPath[] {
    return toArray(map(costMap.entries(), ([loc, cost])=>
        gu.DIRECTIONS.reduce((acc:CheatPath[],dir)=> {
            const delta = gu.directionMap[dir];
            const start = gu.getPointMultiton(gu.addPoints(loc,delta));

            if(costMap.has(start))
                return acc;

            //const dir2 = gu.getPointMultiton(gu.multiplyPoint(dirP,2));
            //const end = gu.getPointMultiton(gu.addPoints(loc,dir2));

            const end = gu.getPointMultiton(gu.addPoints(start,delta));
            const saving = (costMap.get(end) ?? NaN) - (cost + 2);

            console.log({loc,cost,end,saving});

            if(saving > 0)
                acc.push({ start, end, saving });
            
            return acc;
           } ,[])
    )).flat();
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const track = gu.parseGrid<Tile>(cleanedLines);

    const startLoc = gu.findAll(track,"S")[0];
    const endLoc = gu.findAll(track,"E")[0];

    gu.setTile(track, startLoc, ".");
    gu.setTile(track, endLoc, ".");

    console.log(gu.renderGrid(track));

    const costMap = buildCostMap(track, startLoc, endLoc);

    console.log(costMap);

    const shortcuts = findShortcuts(track, costMap);

    console.log(shortcuts);

    const aggregated = shortcuts.reduce((acc,cur)=>(
                                        acc[cur.saving] = (acc[cur.saving] ?? 0) + 1,
                                            acc)
                                        ,{} as { [key:number]:number });

    console.log(aggregated);

    const answer = Object.entries(aggregated).reduce(
        (acc,[saved,shortcutCount])=> Number(saved) >= 100 ? acc + shortcutCount : acc,0);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
