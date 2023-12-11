import { runMain, } from "../util.ts";

export type Point = [x:number,y:number];

export function pointsEqual([lx,ly]:Point,[rx,ry]:Point):boolean {
    const ret = lx == rx && ly == ry;
    return ret;
}

export type Tile = "|" | "-" | "L" | "J" | "7" | "F" | "." | "S";

export type DirectionMap<T extends string> = {
    [Prop in T]: (p:Point)=>Point[];
}

export const directionMap:DirectionMap<Tile> = {
    "|" : ([x,y]:Point):Point[]=> [[x,y+1],[x,y-1]],
    "-" : ([x,y]:Point):Point[]=> [[x+1,y],[x-1,y]],
    "L" : ([x,y]:Point):Point[]=> [[x+1,y],[x,y-1]],
    "J" : ([x,y]:Point):Point[]=> [[x-1,y],[x,y-1]],
    "7" : ([x,y]:Point):Point[]=> [[x,y+1],[x-1,y]],
    "F" : ([x,y]:Point):Point[]=> [[x,y+1],[x+1,y]],
    "." : ([x,y]:Point):Point[]=> [],

    "S" : ([x,y]:Point):Point[]=> [[x-1,y],[x,y-1], [x,y+1],[x+1,y]],
};

export type PipeGrid = {
  startPos: Point,
  tiles: Tile[][]
}

export function getLoc(grid:PipeGrid, p:Point):Tile {
    return _getLoc(grid.tiles,p);
}

export function _getLoc<T>(grid:T[][] , [x,y]:Point):T {
    return grid[y][x];
}

export function getConnections(grid:PipeGrid, loc:Point):Point[] {
    return _getConnections(grid.tiles,loc,directionMap);
}

export function _getConnections<T extends string>(grid:T[][], loc:Point, directionMap:DirectionMap<T>):Point[] {
    const tile = _getLoc(grid,loc);

    const maxY = grid.length;
    const maxX = grid[0].length;

    const outgoing =
        directionMap[tile](loc)
        .filter(([x,y])=> x >= 0 && x < maxX && y >= 0 && y < maxY);

    if(tile !== "S")
        return outgoing

    const returning = outgoing.filter(p=>
                                      directionMap[_getLoc(grid, p)](p)
                                      .some(q => pointsEqual(q, loc))
                                     );
    //console.log("in getConnections",loc,tile,outgoing);
    return returning;
}

export function parseGrid(lines:string[]):PipeGrid {
    let startPos:Point = [-1,-1];
    const tiles = lines.map((l,y)=> l.split("").map((c,x)=>{
        if(c === "S")
            startPos = [x,y];
        return c as Tile;
    }));
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
