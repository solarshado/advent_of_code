import { PriorityQueue, runMain, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";
import { memoize, pipe, } from '../func_util.ts';
import * as gu from "../grid_util.ts";

//export const SIZE = 6;
//export const LANDED_BYTES = 12;
export const SIZE = 70;
export const LANDED_BYTES = 1024;

export const startPos = gu.getPointMultiton(0,0);
export const destPos = gu.getPointMultiton(SIZE,SIZE);

export type MemSpace = Map<gu.Point,number>;

export function parsePoint(s:string):gu.Point {
    const [x,y] = s.split(",");
    return gu.getPointMultiton(+x,+y);
}

export function buildMemSpace(bytes:gu.Point[]):MemSpace {
    return new Map(bytes.map((b,i)=>[b,i]));
}

export function getValidNextMoves(loc:gu.Point, space:MemSpace) {
    return gu.getManhattanNeighborhood(loc)
        .map(p=>gu.getPointMultiton(p))
        .filter(([x,y])=>
            x >= 0 && x <= SIZE &&
            y >= 0 && y <= SIZE &&
            !space.has(gu.getPointMultiton(x,y))
        );
}

export function findShortestPath(startLoc:gu.Point, destLoc:gu.Point, space:MemSpace):number {

    const seen = new Set<gu.Point>();

    const toVisit = new PriorityQueue<gu.Point>();
    toVisit.add(0,startLoc);

    while(toVisit.getLowest(true) !== undefined) {
        const curDist = toVisit.minExtantPriority!;
        const cur = toVisit.getLowest()!;

        console.log({cur,curDist});

        if(gu.pointsEqual(cur,destLoc))
            return curDist;

        for(const next of getValidNextMoves(cur,space)) {
            //console.log({cur,curDist,next});
            if(!seen.has(next)) {
                seen.add(next);
                toVisit.add(curDist+1,next);
            }
        }
    }

    throw "no path found!";
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const bytes = cleanedLines.map(parsePoint).slice(0,LANDED_BYTES);

    const memSpace = buildMemSpace(bytes);

    //console.log(memSpace);

    const answer = findShortestPath(startPos,destPos,memSpace);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
