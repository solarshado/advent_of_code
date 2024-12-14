import { positiveModulo, product, runMain, } from "../util.ts";
import * as gu from "../grid_util.ts";

// for example input
//export const maxX = 11, maxY = 7;
export const maxX = 101, maxY = 103;

export type Robot = {
    pos: gu.Point,
    vel: gu.Point
};

export function parseRobot(line:string):Robot {
    const [_,posX,posY,velX,velY] = Array.from(/p=(\d+),(\d+) v=(-?\d+),(-?\d+)/.exec(line)!).map(Number);
    return {
        pos: [posX, posY],
        vel: [velX, velY]
    };
}

export function simRobotMovement(robots:Robot[], steps:number, maxX:number, maxY:number):Robot[] {
    return robots.map(({pos,vel})=>{
        const [posX,posY] = pos;
        const [velX,velY] = vel;

        const newPos = [
            positiveModulo(posX + (velX*steps), maxX),
            positiveModulo(posY + (velY*steps), maxY)
        ] as gu.Point;

        return {pos: newPos, vel}; 
    });
}

export function calcSafetyFactor(robots:Robot[], maxX:number, maxY:number):number {
    const midX = Math.floor(maxX / 2);
    const midY = Math.floor(maxY / 2);

    const quadCount = robots.reduce((acc,cur)=>{
        const {pos:[posX,posY]} = cur;

        if(posX === midX || posY === midY)
            return acc;

        const x = Number(posX > midX);
        const y = Number(posY > midY);

        acc[x][y]++;

        return acc;
    }, [[0,0],[0,0]] as [[number,number],[number,number]]);

    return product(quadCount.flat());
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const robots = cleanedLines.map(parseRobot);

    console.log(robots);

    const robots2 = simRobotMovement(robots,100,maxX,maxY);

    console.log(robots2);

    const answer = calcSafetyFactor(robots2,maxX,maxY)

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
