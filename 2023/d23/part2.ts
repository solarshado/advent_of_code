import { runMain, sum, } from "../util.ts";
import { concat, count, map } from "../iter_util.ts";
import * as gu from "../grid_util.ts";
import * as d17p1 from "../d17/part1.ts";

import { Tile, Grid, Point, PointManager, }  from './part1.ts';
import * as p1 from './part1.ts';
import { memoize } from "../func_util.ts";

export function getNextSteps(grid:Grid, loc:Point):Point[] {
    const tile = gu.getTileFrom(loc as gu.Point,grid);

    const neighborsFor = (...d:d17p1.Direction[])=>d
                            .map(dir=>({dir, loc: PointManager.add(d17p1.directionMap[dir], loc)}))
                            .filter(({loc})=>gu.isPointOnGrid(loc as gu.Point,grid))
                            .map(o=>({...o, tile: gu.getTileFrom(o.loc as gu.Point, grid)}));
    const neighborFor = (d:d17p1.Direction)=> neighborsFor(d)[0].loc;

    /*
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
    //    */
        return neighborsFor(...d17p1.DIRECTIONS).filter(({tile})=>tile !== "#").map(o=>o.loc);
}

interface IPath {
    junctions:Set<Point>;
    length:number;
    end:Point;

    //contained:Set<Point>;
}

class Path implements IPath {
    public junctions:Set<Point>;
    constructor(
        junctions:Iterable<Point>,
        public end:Point,
        public length:number,

        //public contained:Set<Point>,
    ) {
        this.junctions = new Set(junctions)
    }

    clone():Path {
        return new Path(
            this.junctions,
            this.end,
            this.length,
            //this.contained,
        );
    }

    withAppended(other:IPath):Path {
        // -1 becasue endpoints should overlap
        return new Path(
            concat(this.junctions, other.junctions),
            other.end,
            this.length + other.length,
            //new Set(concat(this.contained, other.contained)),
        );
    }
}

function _getPathSegmentsFrom(grid:Grid, from:Point):IPath[] {
    return getNextSteps(grid, from).map((p):IPath|null=>{

        const steps = new Set([from,p]);

        let end = p;

        let next = getNextSteps(grid, end)
                        .filter(n=>!steps.has(n));

        while(next.length == 1) {
            const [n] = next;

            if(steps.has(n))
                return null;

            steps.add(n);
            end = n;

            next = getNextSteps(grid, end)
                        .filter(n=>!steps.has(n));
        }

        const length = steps.size-1;
        const junctions = new Set([from,end]);

        return {end, junctions, length, contained: steps}
    }).filter((p):p is IPath=>p!==null);
}

function findLongestPath(grid:Grid, startLoc:Point, destLoc:Point) {

    debugger;
    const getPathSegmentsFrom =
        memoize((p:Point)=>_getPathSegmentsFrom(grid,p));

    const initPath = new Path([startLoc], startLoc, 0 /*,new Set([startLoc])*/ );

    let longest = initPath;

    const queue = [initPath];

    while(queue.length > 0) {
        const cur = queue.shift()!;

        if(cur.end == destLoc && cur.length > longest.length) {
            longest = cur;
            continue;
        }

        const next = getPathSegmentsFrom(cur.end);

        const nextPaths = next
                            .filter(n=>!cur.junctions.has(n.end))
                            .map(n=>cur.withAppended(n));

        queue.unshift(...nextPaths);
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

    console.log(gu.renderPoints(grid,longestPath.junctions as Iterable<gu.Point>, "O"));
    //console.log(gu.renderPoints(grid,longestPath.contained as Iterable<gu.Point>, "O"));

    const answer = longestPath.length;

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
