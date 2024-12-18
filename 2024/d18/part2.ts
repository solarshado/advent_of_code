import { runMain, } from "../util.ts";
import * as gu from "../grid_util.ts";
import * as p1 from './part1.ts';

//export const SIZE = 6;
//export const LANDED_BYTES = 12;
export const SIZE = 70;
export const LANDED_BYTES = 1024;

export const startPos = gu.getPointMultiton(0,0);
export const destPos = gu.getPointMultiton(SIZE,SIZE);

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const bytes = cleanedLines.map(p1.parsePoint);

    let landedCount = LANDED_BYTES;

    while(true) {
        const landedBytes = bytes.slice(0,landedCount);
        const memSpace = p1.buildMemSpace(landedBytes);

        const pathCost = p1.findShortestPath(startPos,destPos,memSpace,SIZE);
        const canTraverse = Number.isFinite(pathCost);

        //console.log({landedCount,pathCost,canTraverse});

        if(!canTraverse)
            break;

        landedCount++;

        if(landedCount > bytes.length)
            throw "never got blocked";
    }

    const answer = bytes[landedCount-1];
    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
