import { runMain, } from "../util.ts";
import { memozie, pipe, memoCacheSym } from '../func_util.ts';
import { Tile, Grid, calcTotalLoad, rollStonesNorth } from './part1.ts';
import { parseGrid, renderGrid, rotateGrid90DegCW, } from "../grid_util.ts";


function _spinCycle(grid:Grid):Grid {
    return pipe(grid,
        rollStonesNorth,
        rotateGrid90DegCW,
        rollStonesNorth,
        rotateGrid90DegCW,
        rollStonesNorth,
        rotateGrid90DegCW,
        rollStonesNorth,
        rotateGrid90DegCW,
    );
}

const spinCycle = memozie(_spinCycle,renderGrid);

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const grid = parseGrid<Tile>(cleanedLines);

    //console.log(renderGrid(grid));

    const rotated = ((g)=>{
        const init_iterations = 1_000_000_000;
        let iterations = init_iterations;
        let lastCacheSize = -1;

        // this should work, since my memoization func returns the same reference every time
        const loopStates = new Set<typeof g>()
        let lastLoopStateSize = -1;

        for(let i = 0; i < iterations; ++i) {
            g = spinCycle(g)

            console.log("cycle",i,"done", (i/iterations)*100+"%","cacheSize",spinCycle[memoCacheSym].size);

            const curCacheSz = spinCycle[memoCacheSym].size;
            if(curCacheSz != lastCacheSize) {
                lastCacheSize = curCacheSz;
            }
            else {
                // got a cache hit -> cycle detected exists, find it
                loopStates.add(g);

                if(lastLoopStateSize == -1) {
                    console.log("cache size stalled at",curCacheSz,);
                    lastLoopStateSize = loopStates.size;
                }
                else {
                    const curLoopStateSz = loopStates.size;
                    if(lastLoopStateSize != curLoopStateSz) {
                        lastLoopStateSize = curLoopStateSz;
                    }
                    else {
                        // loop found!
                        const zeroToFirstLoopEnd = curCacheSz;
                        const loopLength = curLoopStateSz;
                        const prequel = zeroToFirstLoopEnd - loopLength;

                        console.log("loop found, size",loopLength, "prequel len was",prequel);

                        iterations = init_iterations - (Math.floor(iterations / loopLength) * loopLength);
                        while(iterations < i)
                            iterations += loopLength;

                        console.log("reset iterations to",iterations);
                    }
                }
            }

        }
        return g;
    })(grid);

    //console.log(renderGrid(rotated));

    const answer = calcTotalLoad(rotated)

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
