import { runMain, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";
import * as gu from "../grid_util.ts";

export type Grid = gu.Grid<string>;

function* find(grid:Grid, filterFunc:(s:string)=>boolean) {
    for(let y = 0; y < grid.length; y++)
   for(let x = 0; x < grid[y].length; x++) {
       if(filterFunc(grid[x][y]))
           yield [x,y] as gu.Point;
   }
}

function countXMASes(grid:Grid) {

    const xs = gu.findAll(grid,"X");
    const ms = xs.reduce((acc,x)=> {
                         const ms = gu.getNeighborhood(grid,x).filter(p=> gu.getTileFrom(p,grid) === "M");
                         acc.push(...(ms.map(m=>[x,m] as [gu.Point,gu.Point])));
                         return acc;
    }, [] as [gu.Point,gu.Point][]);

    const tails = ms.filter(([x,m])=>{
        const delta = gu.subtractPoints(m,x);
        const maybeA = gu.addPoints(m,delta);
        const maybeS = gu.addPoints(maybeA,delta);

        return gu.isPointOnGrid(maybeA,grid) && gu.getTileFrom(maybeA,grid) === "A" &&
            gu.isPointOnGrid(maybeS,grid) && gu.getTileFrom(maybeS,grid) === "S";
    });

    return tails.length;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const grid = gu.parseGrid<string>(cleanedLines);

    //console.log(grid);

    const answer = countXMASes(grid);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
