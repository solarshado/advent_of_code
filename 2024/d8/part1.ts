import { runMain, } from "../util.ts";
import { count, } from "../iter_util.ts";
import * as gu from "../grid_util.ts";
import { genPairs } from "../iter_util.ts";

export type Transmitter = string & {length: 1};
export type Grid = gu.Grid<Transmitter>;

export function findTransmitters(grid:Grid):Map<Transmitter,Set<gu.Point>> {
    const retVal = new Map<Transmitter,Set<gu.Point>>();

    for(let y = 0; y < grid.length; ++y)
    for(let x = 0; x < grid[0].length; ++x) {
        const p = gu.getPointMultiton(x,y);
        const tile = gu.getTileFrom(p,grid);

        if(tile == '.')
            continue;

        if(!retVal.has(tile))
            retVal.set(tile,new Set());

        const set = retVal.get(tile)!;
        set.add(p);
    }

    return retVal;
}

export function findAntiNodes(transmitters:Map<Transmitter,Set<gu.Point>>, grid:Grid) {
    const retVal = new Set<gu.Point>();
    
    for(const [_,locs] of transmitters)
    for(const [a,b] of genPairs([...locs])) {
        const delta = gu.subtractPoints(b,a);

        const nodeOne = gu.subtractPoints(a,delta);
        const nodeTwo = gu.addPoints(b,delta);

        const nodes = [nodeOne,nodeTwo]
            .filter(n=>gu.isPointOnGrid(n,grid))
            .map(([x,y])=>gu.getPointMultiton(x,y));

        for(const n of nodes)
            retVal.add(n);
    }

    return retVal;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const grid = gu.parseGrid<Transmitter>(cleanedLines);

    const transmitters = findTransmitters(grid);

    console.log(transmitters);

    const nodes = findAntiNodes(transmitters, grid);
    
    console.log(nodes);

    const answer = count(nodes);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
