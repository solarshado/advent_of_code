import { runMain, sum, } from "../util.ts";
import { count, map, toArray } from "../iter_util.ts";
import { parseGrid, Point, Grid as AbstractGrid, renderGrid, pointToKey, getTileFrom, addPoints, isPointOnGrid, renderPoints } from "../grid_util.ts"
import { pipe } from "../func_util.ts";

export type Tile = "."|"\\"|"/"|"|"|"-";
export type Grid = AbstractGrid<Tile>;

export type Direction = "U"|"D"|"L"|"R";

export type State = {loc:Point, dir:Direction};

export const directionMap:{ [key in Direction]: Point } = {
    U: [0,-1],
    D: [0,+1],
    L: [-1,0],
    R: [+1,0],
}

export function nextDirections(d:Direction, t:Tile):Direction[] {
    switch(t) {
        case ".":
            return [d];
        case "-":
            return d === "U" || d === "D" ?
            ["L","R"] :
            [d];
        case "|":
            return d === "L" || d === "R" ?
            ["U","D"] :
            [d];
        case "\\":
            return [({
            U: "L",
            D: "R",
            L: "U",
            R: "D",
        } as const)[d]];
        case "/":
            return [({
            U: "R",
            D: "L",
            L: "D",
            R: "U",
        } as const)[d]];
    }
    throw `bad direction+tile: '${d} + ${t}'`;
}

export const initState:State = { loc: [0,0], dir: "R" }

export function doTraversal(grid:Grid, startState:State):Set<State> {
    const seenStates = new Map<string,State>();
    const stateKeyFunc = ({dir,loc}:State)=>pointToKey(loc)+">"+dir;

    seenStates.set(stateKeyFunc(startState),startState);

    const toVisit = [...visit(startState)];

    do {
        const cur = toVisit.shift()!;
        seenStates.set(stateKeyFunc(cur),cur);

        const n = visit(cur).filter(({loc})=>isPointOnGrid(loc,grid));

        const keyd = n.map(s=>[stateKeyFunc(s),s] as const)
                        .filter(([k,_])=>!seenStates.has(k));

        toVisit.push(...keyd.map(([_,s])=>s));
    } while(toVisit.length > 0);

    console.log("travesal finished, seen:"+seenStates.entries());

    return new Set(seenStates.values())

    function visit({dir,loc}:State):State[] {
        const curTile = getTileFrom(loc,grid);
        const next = nextDirections(dir,curTile).map(d=>({
            loc: addPoints(loc, directionMap[d]),
            dir: d
        }));
        //console.log("visited",loc,curTile,"from",dir, "adding:",next);
        return next;
    }
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const grid:Grid = parseGrid(cleanedLines);

    console.log(renderGrid(grid));

    const allStates = doTraversal(grid, initState);

    const energizedPoints = pipe(allStates,
                                 s=>map(s, ({loc})=>[pointToKey(loc),loc] as const),
                                 s=>    new Map(s).values(),
                                 toArray
                                );

    console.log(renderPoints(grid,energizedPoints, "#"));

    const answer = energizedPoints.length

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
