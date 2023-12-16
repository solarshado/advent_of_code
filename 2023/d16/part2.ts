import { runMain, sum, } from "../util.ts";
import { count, map, toArray } from "../iter_util.ts";
import { Grid, State, directionMap, nextDirections } from './part1.ts';
import { Point, addPoints, getTileFrom, gridHeight, gridWidth, isPointOnGrid, parseGrid, pointToKey, renderGrid, renderPoints } from "../grid_util.ts";
import { pipe, memozie } from "../func_util.ts";

let visit:({ dir, loc }: State)=>State[];

function doTraversal(grid:Grid, startState:State):Set<State> {

    const seenStates = new Map<string,State>();
    const stateKeyFunc = ({dir,loc}:State)=>pointToKey(loc)+">"+dir;

    seenStates.set(stateKeyFunc(startState),startState);

    //gross, but...
    //if(typeof visit === "undefined")
    //    visit = memozie(_visit, stateKeyFunc);
    const visit = _visit;

    const toVisit = [...visit(startState)];

    do {
        const cur = toVisit.shift()!;
        seenStates.set(stateKeyFunc(cur),cur);

        const n = visit(cur).filter(({loc})=>isPointOnGrid(loc,grid));

        const keyd = n.map(s=>[stateKeyFunc(s),s] as const)
                        .filter(([k,_])=>!seenStates.has(k));

        toVisit.push(...keyd.map(([_,s])=>s));
    } while(toVisit.length > 0);

    //console.log("travesal finished, seen:"+seenStates.entries());

    return new Set(seenStates.values())

    function _visit({dir,loc}:State):State[] {
        const curTile = getTileFrom(loc,grid);
        const next = nextDirections(dir,curTile).map(d=>({
            loc: addPoints(loc, directionMap[d]),
            dir: d
        }));
        //console.log("visited",loc,curTile,"from",dir, "adding:",next);
        return next;
    }
}

function* enumerateEdges(grid:Grid):IterableIterator<Point> {
    const mX = gridWidth(grid);
    const mY = gridHeight(grid);

    for(let y = 0; y < mY; ++y) {
        if(y === 0 || y === mY - 1) {
            for(let x = 0; x < mX; ++x)
                yield [x,y];
        }
        else {
            yield [ 0, y ];
            yield [ mX-1, y ];
        }
    }
}

function isCorner([x,y]:Point, grid:Grid):boolean {
    const mX = gridWidth(grid);
    const mY = gridHeight(grid);

    return (
        (x === 0 && ( y === 0 || y === mY-1)) ||
        (y === 0 && ( x === 0 || x === mX-1))

    );
}

function* genPossibleStarts(grid:Grid):IterableIterator<State> {
    const mX = gridWidth(grid);
    const mY = gridHeight(grid);

    for(let y = 0; y < mY; ++y) {
        if(y === 0 || y === mY - 1) {
            for(let x = 0; x < mX; ++x) {
                yield {
                    loc: [x,y],
                    dir: y === 0 ? "D" : "U"
                };
            }
        }
        else {
            yield {
                loc: [ 0, y ],
                dir: "R"
            };
            yield {
                loc:[ mX-1, y ],
                dir: "L",
            };
        }
    }
}

function getEnergizedTiles(grid:Grid, initState:State):number {
    const allStates = doTraversal(grid, initState);

    const energizedPoints = pipe(allStates,
                                 s=>map(s, ({loc})=>[pointToKey(loc),loc] as const),
                                 s=>    new Map(s).values(),
                                 toArray
                                );

//    console.log(renderPoints(grid,energizedPoints, "#"));
    const ret = energizedPoints.length

    console.log("traversed from",initState,"energized",ret);

    return ret;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const grid:Grid = parseGrid(cleanedLines);

    console.log(renderGrid(grid));

    console.log(renderPoints(grid, enumerateEdges(grid), "*"));


    const answer = Math.max(...map(genPossibleStarts(grid), (s)=>getEnergizedTiles(grid,s)));

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
