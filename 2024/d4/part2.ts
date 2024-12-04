import { runMain, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";
import * as gu from "../grid_util.ts";
import { Grid } from './part1.ts';

function countXMASes(grid:Grid) {

    const as = gu.findAll(grid,"A");

    const ms = as.reduce((acc,a)=> {
        const ms = gu.getNeighborhood(grid,a)
        .filter(p=> p[0] != a[0] && p[1] != a[1] &&
                gu.getTileFrom(p,grid) === "M");
        if(ms.length == 2)
            acc.push([a,ms[0],ms[1]] as [gu.Point,gu.Point,gu.Point]);
        return acc;
    }, [] as [gu.Point,gu.Point,gu.Point][]);

    const tails = ms.filter(([a,m1,m2])=>{
        const delta1 = gu.subtractPoints(a,m1);
        const delta2 = gu.subtractPoints(a,m2);

        //d = a - m;
        //-m = d - a;
        //m = a - d;
        //s = a + d;

        const maybeS1 = gu.addPoints(a,delta1);
        const maybeS2 = gu.addPoints(a,delta2);

        return [maybeS1, maybeS2].every(maybeS=>gu.isPointOnGrid(maybeS,grid) && gu.getTileFrom(maybeS,grid) === "S");
    });

    const ret = new Set(tails.map(([[ax,ay],_])=>gu.getPointMultiton(ax,ay)));

    return ret.size; //not "sam"s, but full crosses 
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
