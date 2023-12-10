import { runMain, sum, } from "../util.ts";
import { count } from "../iter_util.ts";
import { map } from "../iter_util2.ts";

export type Point = [x:number,y:number]

export function pointsEqual([lx,ly]:Point,[rx,ry]:Point):boolean {
    const ret = lx == rx && ly == ry;
    //console.log("in pointsEqual",lx,ly,rx,ry,ret);
    return ret;
}

export const directionMap = {
    "|" : ([x,y]:Point):Point[]=> [[x,y+1],[x,y-1]],
    "-" : ([x,y]:Point):Point[]=> [[x+1,y],[x-1,y]],
    "L" : ([x,y]:Point):Point[]=> [[x+1,y],[x,y-1]],
    "J" : ([x,y]:Point):Point[]=> [[x-1,y],[x,y-1]],
    "7" : ([x,y]:Point):Point[]=> [[x,y+1],[x-1,y]],
    "F" : ([x,y]:Point):Point[]=> [[x,y+1],[x+1,y]],
    "." : ([x,y]:Point):Point[]=> [],

    "S" : ([x,y]:Point):Point[]=> [[x-1,y],[x,y-1], [x,y+1],[x+1,y]],
};

type Tile = keyof typeof directionMap;

export type PipeGrid = {
  startPos: Point,
  tiles: Tile[][]
}

export function getLoc(grid:PipeGrid, [x,y]:Point):Tile {
    return grid.tiles[y][x];
}

export function getConnections(grid:PipeGrid, loc:Point):Point[] {
    const tile = getLoc(grid,loc);

    const maxY = grid.tiles.length;
    const maxX = grid.tiles[0].length;

    const outgoing = directionMap[tile](loc).
        filter(([x,y])=> x >= 0 && x < maxX && y >= 0 && y < maxY);

    //console.log("in getConnections",loc,tile,outgoing);

    if(tile !== "S")
        return outgoing

    const returning = outgoing.filter(p=>{
        //console.log("filtering returning",loc,tile,p);

        const othersConnections = directionMap[getLoc(grid,p)](p)
        //console.log("filtering returning",othersConnections);
        const returning = othersConnections.some(q=>pointsEqual(q,loc));
        //console.log("filtering returning",returning);
        return returning;
    });
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
export function __findLoops__(grid:PipeGrid) {
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

export function findLoops(grid:PipeGrid) {
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
    
     /*
    const test = Object.entries(directionMap).map(([s,f])=> {
        const g = [
            [" "," "," "],
            [" ",s," "],
            [" "," "," "]
        ];

        const deltas = f([1,1]);

        for(const [x,y] of deltas)
            g[y][x] = "!"

        return g;
    });

    for( const [r1,r2,r3] of test){
        console.log(r1);
        console.log(r2);
        console.log(r3);
        console.log("               ");
    }

    return;
   //  */

    const grid = parseGrid(cleanedLines);

    console.log(grid);

    const answer = findLoops(grid);

    console.log(answer/2);
}

if(import.meta.main)
    await runMain(main);
