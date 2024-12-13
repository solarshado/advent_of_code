import { runMain, splitArray, sum, } from "../util.ts";
import * as gu from "../grid_util.ts";
import { Machine, } from './part1.ts';

function parseMachine(lines:string[]):Machine {
    const [buttonA,buttonB,prize] = lines.map(l=> {
        const [_,x,y] = Array.from(/.*?: X.(\d+), Y.(\d+)/.exec(l)!).map(Number);
        return [x,y] as gu.Point;
    });
    return { buttonA, buttonB, prize: prize.map(c=>c + 10000000000000) as unknown as gu.Point };
    //return { buttonA, buttonB, prize };
}

function findCheapestSolution(machine:Machine):number|false {
    const {buttonA: [ax,ay], buttonB: [bx,by], prize: [px,py]} = machine;

    /*
    px = ax*A + bx*B
    py = ay*A + by*B

    solve for A

    px -bx*B = ax*A
    (px - bx*B)/ax = A
    A = (px/ax) - (bx*B/ax)

    for B
    py = ay*((px - bx*B)/ax) + by*B
    py = (ay/ax)*(px - bx*B) + by*B

    py/B = ((ay/ax)*(px - bx*B))/B + by

    ((ay/ax)*(px - bx*B))/B ----- aaaah

    for B, try 2
    py = ay*((px/ax) - (bx*B/ax)) + by*B
    py = (ay*px/ax) - (ay*bx*B/ax) + by*B
    py - (ay*px/ax) = (ay*bx*B/ax) + by*B

    ax*(py - (ay*px/ax)) = ax*((ay*bx*B/ax) + by*B)

                = ay*bx*B + ax*by*B
                = B*(ay*bx + ax*by)
    ax*py - ay*px =

    ax*py - ay*px = B*(ay*bx + ax*by)

    (ax*py - ay*px)/(ay*bx + ax*by) = B
    */
    //const B = (ax*py - ay*px)/(ay*bx + ax*by);
    //const A = (px/ax) - (bx*B/ax);

    /// Cramer's rule, stolen from wikipedia's example
    // ax*A + bx*B = px
    // aka a1x + b1y = c1
    //
    // ay*A + by*B = py
    // aka a2x + b2y = c2
    //
    // x = (c1b2 - b1c2)/(a1b2 - b1a2)
    // aka
    const A = (px*by - bx*py)/(ax*by - bx*ay)
    // y = (a1c2 - c1a2)/(a1b2 - b1a2)
    // aka
    const B = (ax*py - px*ay)/(ax*by - bx*ay);

    console.log({machine,A,B});

    const ans = B + (3*A);

    return ans !== Math.trunc(ans) ? false : ans;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim())//.filter(l=>l!='');

    const values = splitArray(cleanedLines,"").filter(a=> a.length === 3);

    const machines = values.map(parseMachine);

    const solutions = machines.map(findCheapestSolution);

    console.log(solutions);

    const answer = sum(solutions, s=>s === false? 0 : s);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
