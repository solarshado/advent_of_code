import { runMain, sum, } from "../util.ts";
import { concat, count, genPairs, map, pairwise, reduce, toArray } from "../iter_util.ts";
import { memoize, pipe, } from '../func_util.ts';
import * as gu from "../grid_util.ts";
import { findCrops, determineRegions} from './part1.ts';

//// skimmed some of the chatter on reddit:
// counting corners will work, if you do it right
// and you can do it right with a simple "visit a tile and look at its open/closed edges"

function findBorders(regionMap:Map<string, Set<gu.Point>[]>) {
    const {maxX, maxY} = reduce(concat(regionMap.values()).flatMap(r=>r).flatMap(r=>r),(acc,[x,y])=>{
        acc.maxX = Math.max(acc.maxX,x);
        acc.maxY = Math.max(acc.maxY,y);
        return acc;
    },{maxX:0, maxY:0});

    for(const [crop, regions] of regionMap)
    for(const region of regions) {
        const rayResults = [];
        /// brain melted
        for(let y=0; y < maxY; ++y) {
            const rayResult = [];
            let lastWasIn = false;
            let lastP:gu.Point = [-100,-100]; // garbage that won't be in any set
            for(let x = 0; x < maxX; ++x) {
                const p = gu.getPointMultiton(x,y);
                /// wtf am I doing... ray casting, right?
                const isIn = region.has(p);

                if(isIn != lastWasIn)
                    rayResult.push({in:isIn, p});

                lastP = p;
                lastWasIn = isIn;
            }

            rayResults.push(rayResult);
        }

        // process rayResults into... 
        rayResults;
        //////////////// that's all I've got for tonight. brain is NOT functioning properly any more. be back some time tomorow
    }


}
// cast for each region individually? or?
//
// for each region:
// for minY to maxY:
// cast from x = 0 to x = maxX
//  ... and?
//  count transitions in and out, noting their X
//  then... aggregate into up-down full edges
//      still have to wathc for shared corners though
//      track if transition is in or out? will that do it?
//
// ther repeat casting along the other axis and total the results?


function getAreaAndPerimiter(regions:Map<string, Set<gu.Point>[]>) {
        return new Map<string, {area:number,sides:number}[]>(
                    map(regions, ([crop,pointSets])=> {
                        const rets = pointSets.map(region=>{
                            const area = region.size;

                            const corners =
                                reduce(region,(acc,cur)=>{
                                const friendlyNeighbors = gu.DIRECTIONS
                                    .filter(dir=> region.has(gu.getPointMultiton(gu.addPoints(cur,gu.directionMap[dir]))));

                                function isInnerIn(d1:gu.Direction, d2:gu.Direction) {
                                    const inner = gu.addPoints(
                                        ...[d1,d2].map(d=>gu.directionMap[d]) as [gu.Point,gu.Point]
                                    );

                                    return region.has(gu.getPointMultiton(gu.addPoints(cur,inner)));
                                }

                                const corners = (function() {switch(friendlyNeighbors.length) {
                                    case 0:
                                        return 4;
                                    case 1:
                                        return 2;
                                    case 2: {
                                        if(gu.areOppositeDirections(...friendlyNeighbors as [gu.Direction,gu.Direction]))
                                            return 0;

                                        return isInnerIn(...friendlyNeighbors as [gu.Direction,gu.Direction]) ? 1 : 2;
                                    }
                                    case 3: {
                                        const friendPairs = genPairs(friendlyNeighbors);
                                        const innerCorners = reduce(friendPairs, (acc,cur)=>
                                                                    acc + (isInnerIn(...cur) ? 0 : 1 )
                                        ,0);

                                        return innerCorners;
                                    }
                                    case 4: {
                                        const friendPairs = genPairs(friendlyNeighbors);
                                        const innerCorners = reduce(friendPairs, (acc,cur)=>
                                                                    acc + (isInnerIn(...cur) ? 0 : 1 )
                                        ,0);

                                        return innerCorners;
                                    }
                                    default:
                                        throw "broken switch";
                                }})();

                                if(crop == "R")
                                    console.log({cur,friendlyNeighbors,corners});

                                return acc + corners;
                            },0);

                            return {area, sides: corners};
                        });

                        return [crop, rets];
                    })
        );
}


export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const map = gu.parseGrid(cleanedLines);

    const crops = findCrops(map);

    const regions = determineRegions(crops);

    const aAndP = getAreaAndPerimiter(regions);

    console.log(aAndP);

    const answer = sum(toArray(aAndP.values()).flat().map(({area,sides})=>area*sides));

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
