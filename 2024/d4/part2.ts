import { runMain, } from "../util.ts";
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

    const tails = ms.filter(([a,m1,m2])=>(
        [(gu.addPoints(a, gu.subtractPoints(a, m1))),
            (gu.addPoints(a, gu.subtractPoints(a, m2)))]
            .every(maybeS=>gu.isPointOnGrid(maybeS,grid) && gu.getTileFrom(maybeS,grid) === "S")
    ));

    return tails.length;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const grid = gu.parseGrid<string>(cleanedLines);

    const answer = countXMASes(grid);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
