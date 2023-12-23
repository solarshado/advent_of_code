import { runMain, } from "../util.ts";
import * as gu from "../grid_util.ts";
import * as d17p1 from "../d17/part1.ts";

export type Tile = "#"|"."|">"|"<"|"v"|"^";
export type Grid = gu.Grid<Tile>;
export type Point = Readonly<gu.Point>;

export const PointManager = (function() {
    const store = new Map<string,Point>();
    return {
        get(x:number,y:number):Point {
            const key = gu.pointToKey([x,y]);
            if(!store.has(key))
                store.set(key,[x,y]);
            return store.get(key)!;
        },
        add(l:Point,r:Point):Point {
            return this.get(l[0]+r[0],l[1]+r[1]);
        }
    };
})();

export function getNextSteps(grid:Grid, loc:Point):Point[] {
    const tile = gu.getTileFrom(loc as gu.Point,grid);

    const neighborsFor = (...d:d17p1.Direction[])=>d
                            .map(dir=>({dir, loc: PointManager.add(d17p1.directionMap[dir], loc)}))
                            .filter(({loc})=>gu.isPointOnGrid(loc as gu.Point,grid))
                            .map(o=>({...o, tile: gu.getTileFrom(o.loc as gu.Point, grid)}));
    const neighborFor = (d:d17p1.Direction)=> neighborsFor(d)[0].loc;

    if(tile === ">") {
        return [neighborFor("R")]
    }
    else if(tile === "<") {
        return [neighborFor("L")];
    }
    else if(tile === "^") {
        return [neighborFor("U")];
    }
    else if(tile === "v") {
        return [neighborFor("D")];
    }
    else
        return neighborsFor(...d17p1.DIRECTIONS).filter(({tile})=>tile !== "#").map(o=>o.loc);
}

export function findLongestPath(grid:Grid, startLoc:Point, destLoc:Point) {
    type Path = {steps:Set<Point>, end:Point, len():number};

    function len(this:Path) {return this.steps.size-1;}

    function clone({end,steps}:Path):Path {
        return {end, steps: new Set(steps), len};
    }

    const initPath:Path = {end: startLoc, steps: new Set([startLoc]), len};

    let longest = initPath;

    //TODO? memoized getNextSegment?

    const queue = [initPath];

    inQueue:
    while(queue.length > 0) {
        const cur = queue.shift()!;

        if(cur.end == destLoc && cur.steps.size > longest.steps.size) {
            longest = cur;
            continue;
        }

        let next = getNextSteps(grid, cur.end);

        while(next.length == 1) {
            const [n] = next;

            if(cur.steps.has(n))
                continue inQueue;

            cur.steps.add(n);
            cur.end = n;

            next = getNextSteps(grid, cur.end);
        }

        const nextPaths = next
                            .filter(n=> !cur.steps.has(n))
                            .map(n=>{
                                const p = clone(cur);
                                p.steps.add(n)
                                p.end = n;
                                return p;
                            });

        queue.push(...nextPaths);
    }

    return longest;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const grid = gu.parseGrid<Tile>(cleanedLines);

    const startY = 0
    const startX = grid[startY].findIndex(t=>t===".");

    const endY = gu.gridHeight(grid) - 1;
    const endX = grid[endY].findIndex(t=>t===".");

    const PM = PointManager;

    const longestPath = findLongestPath(grid, PM.get(startX,startY), PM.get(endX,endY) );

    console.log(gu.renderPoints(grid,longestPath.steps as Iterable<gu.Point>, "O"));

    const answer = longestPath.len();

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
