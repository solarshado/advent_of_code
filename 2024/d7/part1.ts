import { runMain, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";

export type TestEquation = {
    inputs:number[];
    goal:number;
};

export function parseEquation(raw:string):TestEquation {
    const [g, is] = raw.split(":").map(s=>s.trim());

    const goal = +g;
    const inputs = is.split(/\s+/).map(Number);

    return {goal, inputs};
}

function isSolvable({goal,inputs}:TestEquation) {
    const ops = {
        "+": (l:number,r:number)=>l+r,
        "*": (l:number,r:number)=>l*r,
    } as const;

    type Op = keyof typeof ops;

    //const opLists:Op[][] = [];

    inputs = [...inputs];

    let answers = [inputs.shift()!];
    
    for(const input of inputs) {
        answers = answers.flatMap(a=>[
            a+input,
            a*input
        ]);
    }

    //console.log({goal,inputs},answers);

    return answers.some(a=>a===goal);

    //const chains:{ops:(keyof typeof ops)[], total:number}[] = [];
    //
    //chains.push(
    //    ...Object.keys(ops).map(o=>({ops:[o as keyof typeof ops],total:inputs[0]}))
    //);

    // is this actually a good idea?
    // stepwise parallel construction, that is
    // does is matter?
    // O(n) either way, right?
    // alternative.... backtracking? feels eww


}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const equations = cleanedLines.map(parseEquation);

    console.log(equations);

    //const tested = equations.map(e=>({e, s: isSolvable(e)}));

    //console.log(tested);

    const answer = sum(equations.filter(isSolvable), e=>e.goal);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
