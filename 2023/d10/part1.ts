import { runMain, } from "../util.ts";
import * as gu from "../grid_util.ts";
import { Point, pointsEqual, } from "../grid_util.ts";

export type Tile = "|" | "-" | "L" | "J" | "7" | "F" | "." | "S";
export type Grid = gu.Grid<Tile>;

export type DirectionMap<T extends string> = {
    [Prop in T]: (p:Point)=>Point[];
}

export const directionMap:DirectionMap<Tile> = {
    "|" : ([x,y])=> [[x,y+1],[x,y-1]],
    "-" : ([x,y])=> [[x+1,y],[x-1,y]],
    "L" : ([x,y])=> [[x+1,y],[x,y-1]],
    "J" : ([x,y])=> [[x-1,y],[x,y-1]],
    "7" : ([x,y])=> [[x,y+1],[x-1,y]],
    "F" : ([x,y])=> [[x,y+1],[x+1,y]],
    "." : ([x,y])=> [],

    "S" : ([x,y])=> [[x-1,y],[x,y-1], [x,y+1],[x+1,y]],
};

export type PipeGrid = {
  startPos: Point,
  tiles: Grid
}

export function getLoc(grid:PipeGrid, p:Point):Tile {
    return gu.getTileFrom(p, grid.tiles);
}

export function getConnections(grid:PipeGrid, loc:Point):Point[] {
    return _getConnections(grid.tiles,loc,directionMap);
}

export function _getConnections<T extends string>(grid:gu.Grid<T>, loc:Point, directionMap:DirectionMap<T>):Point[] {
    const tile = gu.getTileFrom(loc, grid);

    const maxX = gu.maxX(grid);
    const maxY = gu.maxY(grid);

    const outgoing =
        directionMap[tile](loc)
        .filter(([x,y])=> x >= 0 && x < maxX && y >= 0 && y < maxY);

    if(tile !== "S")
        return outgoing

    const returning = outgoing.filter(p=>
                                      directionMap[gu.getTileFrom(p, grid)](p)
                                      .some(q => pointsEqual(q, loc))
                                     );
    //console.log("in getConnections",loc,tile,outgoing);
    return returning;
}

export function parseGrid(lines:string[]):PipeGrid {
    let startPos:Point = [-1,-1];
    const tiles = gu.parseGrid<Tile>(lines, (p,t)=>{
        if(t === "S")
            startPos = p;
    });
    return {tiles, startPos};
}

/// DAMNIT full problem stack overflows
export function __findLoops__(grid:PipeGrid):number {
    function step(grid:PipeGrid, curLoc:Point, depth:number, prevLoc:Point|null = null):number {
        const tile = getLoc(grid,curLoc)
        console.log("step",curLoc,tile,depth);
        if(depth != 0 && tile == "S")
            return depth;

        const next = getConnections(grid,curLoc);

        console.log("step",next);

        const z = next
            .filter(n=>prevLoc != null ? !pointsEqual(n,prevLoc) : true)
            .slice(0,1) // cheat?
            .map(pos=>step(grid, pos, depth+1, curLoc));

         return Math.max(...z);
    }

    return step(grid, grid.startPos, 0);
}

// misnamed... oh well
export function findLoops(grid:PipeGrid):number {
    type Loc = {loc:Point, depth:number, prevLoc?:Point};

    const locs:Loc[] = [{loc: grid.startPos, depth: 0 }];
    let maxDepth = 0;

    while(locs.length > 0) {
        const {loc:curLoc, depth, prevLoc}= locs.shift()!;

        maxDepth = Math.max(maxDepth, depth);

        const tile = getLoc(grid,curLoc)
        console.log("step",curLoc,tile,depth);
        if(depth != 0 && tile == "S")
            continue;

        const connections = getConnections(grid,curLoc);

        console.log("step",connections);

        const next = connections
            .filter(n=>prevLoc != null ? !pointsEqual(n,prevLoc) : true)
            .slice(0,1) // cheat?
            .map(loc=>({
                loc,
                depth: depth+1,
                prevLoc: curLoc,
            }));

        locs.push(...next);
    }

    return maxDepth;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');
    
    const grid = parseGrid(cleanedLines);

    console.log(grid);

    const answer = findLoops(grid) / 2;

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
