import { runMain, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";

export type Foo = {
    TODO:unknown,
};

function splitLists(inputLines:string[]) {
    const l1 = [], l2 = [];

    for(const line of inputLines) {
        const [_, v1 ,v2] = Array.from(/(\d+)\s+(\d+)/.exec(line)!);

        l1.push(Number(v1));
        l2.push(Number(v2));
    }

    return [l1,l2] as const;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const [leftList, rightList] = splitLists(cleanedLines);

    leftList.sort((a,b)=>a-b);
    rightList.sort((a,b)=>a-b);

    const pairs = leftList.map((val,i)=>[val,rightList[i]] as const);

    console.log(pairs);

    const answer = pairs.reduce((acc,[l,r])=>acc+ Math.abs(l-r) ,0)

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
