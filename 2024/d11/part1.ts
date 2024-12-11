import { runMain, } from "../util.ts";

// cellular automata time!

export type Rule = {
    matches: (n:number)=>boolean,
    apply: (input:number)=>(number|number[])
};

export const RULES:Rule[] = [
    { matches: n=> n == 0, apply: n=> 1},
    { matches: n=> (""+n).length % 2 == 0, apply: n=> {
        const str = ""+n;
        const first = str.substring(0, str.length /2);
        const second = str.substring((str.length /2));
        return [first,second].map(Number);
    }},
    { matches: n=> true, apply: n=> n * 2024},
];


export function applyRules(input:number[], rules:Rule[]=RULES):number[] {
    return input.flatMap(n=>{
        for(const {matches: test, apply} of rules)
            if(test(n))
                return apply(n);
        throw "no matching rule";
    });
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const values = cleanedLines[0].split(" ").map(Number);

    console.log(values);

    let answer = values;
    let blinks = 0;
    while(true) {
        console.log(answer);
        answer = applyRules(answer);
        if(++blinks == 25)
            break;
    }

    console.log(answer.length);
}

if(import.meta.main)
    await runMain(main);
