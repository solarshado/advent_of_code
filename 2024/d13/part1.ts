import { runMain, splitArray, sum, } from "../util.ts";
import { memoize, } from '../func_util.ts';
import * as gu from "../grid_util.ts";

export const btnACost = 3, btnBCost = 1;

export type Machine = {
    buttonA: gu.Point,
    buttonB: gu.Point,
    prize: gu.Point
};

export function parseMachine(lines:string[]):Machine {
    const [buttonA,buttonB,prize] = lines.map(l=> {
        const [_,x,y] = Array.from(/.*?: X.(\d+), Y.(\d+)/.exec(l)!).map(Number);
        return [x,y] as gu.Point;
    });
    return { buttonA, buttonB, prize };
}

const pushLimit = 100;

export function mulPoint([x,y]:gu.Point, factor:number):gu.Point {
    return [x*factor, y*factor];
}

export function findCheapestSolution(machine:Machine):number|false {
    const {buttonA, buttonB, prize} = machine;

    const innerRecurse = memoize(_innerRecurse);

    function _innerRecurse(countA:number, countB:number):{countA:number,countB:number}|false {
        if(countA > pushLimit || countB > pushLimit)
            return false;

        const aTot = mulPoint(buttonA, countA);
        const bTot = mulPoint(buttonB, countB);
        const tot = gu.addPoints(aTot,bTot);

        if(gu.pointsEqual(tot,prize))
            return {countA, countB};

        if(tot[0] > prize[0] || tot[1] > prize[1])
            return false;

        return innerRecurse(countA, countB+1) || innerRecurse(countA+1, countB);
    }

    const recurseResult = innerRecurse(0,0);
    if(recurseResult === false)
        return recurseResult;

    return recurseResult.countA * btnACost + recurseResult.countB * btnBCost;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim())//.filter(l=>l!='');

    const values = splitArray(cleanedLines,"").filter(a=> a.length === 3);

    const machines = values.map(parseMachine);

    console.log(machines);

    const solutions = machines.map(findCheapestSolution);

    console.log(solutions);

    const answer = sum(solutions, s=>s === false? 0 : s);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);

