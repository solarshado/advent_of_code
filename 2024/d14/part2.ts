import { runMain, sum, } from "../util.ts";
import { count, map, range } from "../iter_util.ts";
import { memoize, pipe, } from '../func_util.ts';
import * as gu from "../grid_util.ts";
import { maxX, maxY, parseRobot, Robot, simRobotMovement } from './part1.ts';

//const blankGrid = Array(maxY).fill(Array(maxX));
const blankGrid = Array(maxY).fill(Array(maxX).fill("."));

function renderRobots(robots:Robot[], maxX:number, maxY:number) {

    const robotSet = new Set(robots.map(r=>gu.getPointMultiton(r.pos)));

    const render = gu.renderPoints(blankGrid,robotSet,"*");

    return render;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const robots = cleanedLines.map(parseRobot);

    //console.log(robots);
    //console.log({blankGrid})

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
        //console.log({renderLines}); break;
        //if(renderLines.some(l=>/\*{6,}/.exec(l) !== null)) {
        if(renderLines.some(l=>/\*{10,}/.exec(l) !== null)) {
            console.log({secs:i});
            console.log(render);
            break;
        }
    }

    //console.log(robots2);

    //const answer = calcSafetyFactor(robots2,maxX,maxY)

    //console.log(answer);
}

if(import.meta.main)
    await runMain(main);
