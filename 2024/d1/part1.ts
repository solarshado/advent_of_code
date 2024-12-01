import { runMain, sortedNumeric, sum, } from "../util.ts";

export function splitLists(inputLines:string[]) {
    const leftList = [], rightList = [];

    for(const line of inputLines) {
        const [_, v1 ,v2] = Array.from(/(\d+)\s+(\d+)/.exec(line)!);

        leftList.push(+v1);
        rightList.push(+v2);
    }

    return {leftList,rightList} as const;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    let {leftList, rightList} = splitLists(cleanedLines);

    leftList = sortedNumeric(leftList);
    rightList = sortedNumeric(rightList);

    const answer = sum(
        leftList.map((val,i)=>[val,rightList[i]] as const),
        ([l,r])=>Math.abs(l-r));

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
