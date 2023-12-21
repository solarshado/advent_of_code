import { runMain, sum, } from "../util.ts";
import { count, filter, map, toArray } from "../iter_util.ts";

import * as gu from "../grid_util.ts";
import { Point, parseGrid } from "../grid_util.ts";
import { pipe } from "../func_util.ts";
import * as day17 from "../d17/part1.ts";

export type Tile = "S"|"."|"#"
export type Grid = gu.Grid<Tile>

export function findStartPoint(grid: Grid): gu.Point {
    let x = -1;
    const y = grid.findIndex(line=> {
        const s = line.findIndex(t=>t==="S");
        if(s==-1)
            return false;
        x = s;
        return true;
    });
    return [x,y];
}

///import { getNeighborhood,} from "../d18/part1.ts";
export function getNeighborhoodCoords(grid:Grid, [x,y]:Point) {
    const minX = Math.max(x-1,0);
    const maxX = Math.min(x+1,gu.gridWidth(grid)-1);
    const minY = Math.max(y-1,0);
    const maxY = Math.min(y+1,gu.gridHeight(grid)-1);

    return {minX, maxX, minY, maxY};
}
export function getNeighborhood(grid:Grid, p:Point):Point[] {
    const {minX, maxX, minY, maxY} =
        getNeighborhoodCoords(grid,p);

    const ret = [];

    for(let y = minY; y < maxY+1; ++y)
        for(let x = minX; x < maxX+1; ++x) {
            const p = [x,y] as Point;
            if(gu.isPointOnGrid(p,grid))
                ret.push(p);
        }

    return ret;
}

export function countAcessibleTiles(grid:Grid, maxPathLength:number) {
    const canWalk = (t:Tile)=>t === "." || t === "S";

    const keyfunc = gu.pointToKey;
    const visited = new Map<string,number>()

    const toCheck = [
        {loc: findStartPoint(grid), stepsTaken: 0}
    ];

    while(toCheck.length > 0) {
        const {loc,stepsTaken} = toCheck.shift()!;
        const key = keyfunc(loc);

        if(visited.has(key))
            continue;

        visited.set(key,stepsTaken);

        if(stepsTaken >= maxPathLength)
            continue;

        const next = day17.DIRECTIONS.map(d=>gu.addPoints(loc,day17.directionMap[d]))
                        .filter(p=> gu.isPointOnGrid(p,grid) && canWalk(gu.getTileFrom(p, grid)))
                        .map(loc=>({loc, stepsTaken: stepsTaken+1}));
        toCheck.push(...next)
    }

    console.log(visited)

    const sameRemainder = (a:number,b:number,mod:number)=> a % mod === b % mod;

    const validDestinations = pipe(visited.entries(),
                                   e=>filter(e,([_,v])=>v === maxPathLength || sameRemainder(v,maxPathLength,2)),
                                   e=>map(e,([k,_])=>k.split(",").map(Number) as Point),
                                   toArray);

    console.log(gu.renderPoints(grid, validDestinations, "O"))

    return count(validDestinations);
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const map = parseGrid<Tile>(cleanedLines);

    console.log(gu.renderGrid(map));

    const answer = countAcessibleTiles(map,64);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);

