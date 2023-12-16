import { runMain, } from "../util.ts";
import { map, toArray } from "../iter_util.ts";
import { Grid, State, doTraversal, } from './part1.ts';
import { gridHeight, gridWidth, parseGrid, pointToKey, renderGrid, } from "../grid_util.ts";
import { pipe, } from "../func_util.ts";

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

    const ret = energizedPoints.length

    //console.log("traversed from",initState,"energized",ret);

    return ret;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const grid:Grid = parseGrid(cleanedLines);

    console.log(renderGrid(grid));

    const answer = Math.max(...map(genPossibleStarts(grid), (s)=>getEnergizedTiles(grid,s)));

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
