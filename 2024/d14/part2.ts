import { runMain, } from "../util.ts";
import * as gu from "../grid_util.ts";
import { maxX, maxY, parseRobot, simRobotMovement } from './part1.ts';

const blankGrid = Array(maxY).fill(Array(maxX).fill("."));

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const robots = cleanedLines.map(parseRobot);

    let r2=robots;
    let i = 0;
    while(true) {
        i++
        if(i%10000===0)
            console.log({secs:i});

        r2 = simRobotMovement(r2,1,maxX,maxY);

        const robotSet = new Set(r2.map(r=>gu.getPointMultiton(r.pos)));

        const render = gu.renderPoints(blankGrid,robotSet,"*");

        const renderLines = render.split("\n");

        if(renderLines.some(l=>/\*{10,}/.exec(l) !== null)) {
            console.log(render);
            console.log({secs:i});
            break;
        }
    }
}

if(import.meta.main)
    await runMain(main);
