import { runMain, sum, } from "../util.ts";
import { Reducer } from "../func_util.ts";

export type Combiner = Reducer<number,number>;

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

export const DEFAULT_COMBINERS:Combiner[] = [
    (l,r)=>l+r,
    (l,r)=>l*r,
] as const;

export function isSolvable({goal,inputs}:TestEquation, combiners:Combiner[]=DEFAULT_COMBINERS) {
    inputs = [...inputs];

    let answers = [inputs.shift()!];
    
    // this *could* scale very poorly
    // but luck is with me: not too poorly for this use case
    for(const input of inputs)
        answers = answers.flatMap(a=> combiners.map(c=>c(a,input)));

    return answers.some(a=>a===goal);
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const equations = cleanedLines.map(parseEquation);

    //console.log(equations);

    const answer = sum(equations.filter(e=>isSolvable(e)), e=>e.goal);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
