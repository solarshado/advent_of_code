import { runMain, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";
import { memoize, pipe, } from '../func_util.ts';
import * as gu from "../grid_util.ts";
import * as p1 from './part1.ts';
import { SIZE, LANDED_BYTES, startPos, destPos } from './part1.ts';

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const bytes = cleanedLines.map(p1.parsePoint);

    let landedCount = LANDED_BYTES;

    const blankGrid = gu.genGrid(SIZE+1,SIZE+1);

    console.log({blankGrid});

    while(true) {

        //if(landedCount ==21)
        //   debugger;

        const landedBytes = bytes.slice(0,landedCount);

        const memSpace = p1.buildMemSpace(landedBytes);

        //console.log(memSpace);
        console.log(gu.renderPoints(blankGrid, landedBytes, "#"));

        const pathCost = p1.findShortestPath(startPos,destPos,memSpace);
        const canTraverse = Number.isFinite(pathCost);

        console.log({landedCount,pathCost,canTraverse});

        if(!canTraverse)
            break;
        else
            landedCount++;

        if(landedCount > bytes.length)
            throw "never got blocked";
    }

    const answer = bytes[landedCount-1];

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
