import { runMain, sum, } from "../util.ts";
import { count, map, concat, toArray, reduce } from "../iter_util.ts";
import { memoize, pipe, } from '../func_util.ts';
import * as gu from "../grid_util.ts";

export type Tile = string;
export type Grid = gu.Grid<Tile>;

function findCrops(map:Grid) {

    const regions = new Map<string, Set<gu.Point>>();

    for(let y = 0 ; y < gu.gridHeight(map) ; ++y)
    for(let x = 0 ; x < gu.gridWidth(map) ; ++x) {
        const tile = gu.getTileFrom([x,y], map);

        if(!regions.has(tile))
            regions.set(tile, new Set());

        regions.get(tile)!.add(gu.getPointMultiton(x,y));
    }

    return regions;
}

function determineRegions(crops:Map<string, Set<gu.Point>>): Map<string, Set<gu.Point>[]> {
    // for each crop, break into contiguous regions
    return new Map<string, Set<gu.Point>[]>(
        map(crops, ([crop,pointSet])=> {

            // replace pointSet with [contiguousPoints, ...];
            let regions = [new Set<gu.Point>];

            pointSet.forEach(p=>{
                if(regions[0].size == 0) {
                    regions[0].add(p)
                    return;
                }

                const neighborhood = new Set(
                    gu.getManhattanNeighborhood(p)
                    .map(p=>gu.getPointMultiton(p))
                );

                const adjacentRegionIdxs = new Set<number>();;

                for(const [regionIdx,region] of regions.entries()) {
                    if(region.intersection(neighborhood).size > 0) {
                        adjacentRegionIdxs.add(regionIdx);
                    }
                }

                if(adjacentRegionIdxs.size === 0)
                    regions.push(new Set<gu.Point>().add(p));
                else if(adjacentRegionIdxs.size === 1) {
                    const destIdx = adjacentRegionIdxs.values().next().value!;
                    regions[destIdx].add(p);
                }
                else {
                    const srcRegions = toArray(map(adjacentRegionIdxs,i=>regions[i]));

                    const newRegion = new Set<gu.Point>(concat(...srcRegions)).add(p);

                    regions = regions.filter((_,i)=>!adjacentRegionIdxs.has(i));
                    regions.push(newRegion);
                }
            });

            return [crop, regions];
        })
    );
}

export function getAreaAndPerimiter(regions:Map<string, Set<gu.Point>[]>) {
        return new Map<string, {area:number,perimiter:number}[]>(
                    map(regions, ([crop,pointSets])=> {
                        const rets = pointSets.map(region=>{
                            const area = region.size;

                            /// additive or subtractive?
                            // finding common edges seems like it might be faster at riuntime but trickier to implement

                            const perimiter = reduce(region,(acc,cur)=>{
                                const friendlyNeighbors = 
                                    gu.getManhattanNeighborhood(cur)
                                    .reduce((acc,cur)=> region.has(gu.getPointMultiton(cur)) ? acc + 1 : acc ,0);

                                return acc + 4 - friendlyNeighbors;
                            },0);

                            return {area, perimiter};
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

    const answer = sum(toArray(aAndP.values()).flat().map(({area,perimiter})=>area*perimiter));

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
