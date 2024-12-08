import { runMain, gcd, } from "../util.ts";
import { count, map } from "../iter_util.ts";
import * as gu from "../grid_util.ts";
import { genPairs } from "../iter_util.ts";
import { findTransmitters, Transmitter, Grid } from './part1.ts';

export function findAntiNodes(transmitters:Map<Transmitter,Set<gu.Point>>, grid:Grid) {
    const retVal = new Set<gu.Point>();
    function addNode([x,y]:gu.Point) {
        retVal.add(gu.getPointMultiton(x,y));
    }
    
    for(const [_,locs] of transmitters)
    for(const [a,b] of genPairs([...locs])) {
        const delta = gu.subtractPoints(b,a);

        addNode(a); addNode(b);

        const reductionFactor = gcd(...delta);
        const reducedDelta = delta.map(v=>v/reductionFactor) as unknown as gu.Point;

        console.log({delta, reductionFactor, reducedDelta});

        let as = a;
        let bs = a; // get in-between points too

        while(true) {
            
            as = gu.subtractPoints(as,reducedDelta);
            bs = gu.addPoints(bs,reducedDelta);

            //console.log({as,bs});

            const nodes = [as,bs].filter(n=>gu.isPointOnGrid(n,grid));

            //console.log({nodes});

            for(const n of nodes)
                addNode(n);

            if(nodes.length == 0)
                break;
        }
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
