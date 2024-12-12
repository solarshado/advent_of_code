import { runMain, sum, } from "../util.ts";
import { genPairs, map, reduce, toArray } from "../iter_util.ts";
import * as gu from "../grid_util.ts";
import { findCrops, determineRegions} from './part1.ts';

//// skimmed some of the chatter on reddit:
// counting corners will work, if you do it right
// and you can do it right with a simple "visit a tile and look at its open/closed edges"
//  (not quite true, but close)

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
                                    case 3: 
                                    case 4: {
                                        return reduce(genPairs(friendlyNeighbors),
                                                      (acc, cur) => acc + (isInnerIn(...cur) ? 0 : 1), 0);
                                    }
                                    default:
                                        throw "broken switch";
                                }})();

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
