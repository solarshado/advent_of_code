import { runMain, splitArray, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";
import { memoize, pipe, } from '../func_util.ts';
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

/* -- wikipedia excerpt
The Chinese remainder theorem can be generalized to non-coprime moduli. Let 
m , n , a , b
 be any integers, let 
g = gcd(m , n) ; M = lcm(m , n)
, and consider the system of congruences:

x ≡ a (mod m)
x ≡ b (mod n)

If a ≡ b (mod g) , then this system has a unique solution modulo 
M = mn / g
. Otherwise, it has no solutions.


If one uses Bézout's identity to write 
g = um + vn ,
then the solution is given by
x = (a v n + b u m) / g

This defines an integer, as g divides both m and n. Otherwise, the proof is very similar to that for coprime moduli
*/

// !! the scores are needed here too?? yes, that's what we're trying to minimize
// so
// x = score?
// x = goal value?
// m , n = button a,b values?
// a , b = button a,b presses?

// u , v = button a,b costs?

// hold on, a and b are remainders, right? shoulnt they be zero?
// no...they're... the remainders after dividing goal by button values?
// so x is the goal, m,n are the button values.


const pushLimit = 100;

export function mulPoint([x,y]:gu.Point, factor:number):gu.Point {
    return [x*factor, y*factor];
}

export function findCheapestSolution(machine:Machine):number|false {
    /////// hmmm....
    // is this that "chinese remainder theorem" thing I've seen mantioned?

    /// one axis at a time, or do the need to be "parallel"?
    // somewhat?

    const {buttonA, buttonB, prize} = machine;

    const innerRecurse = memoize(_innerRecurse);

    function _innerRecurse(countA:number, countB:number):{countA:number,countB:number}|false {
        if(countA > pushLimit || countB > pushLimit)
            return false;

        const aTot = mulPoint(buttonA, countA);
        const bTot = mulPoint(buttonB, countB);
        const tot = gu.addPoints(aTot,bTot);

        //console.log({countA, countB, tot, prize});

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

