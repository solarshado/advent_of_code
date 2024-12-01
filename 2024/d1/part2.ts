import { runMain, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";
import { splitLists } from './part1.ts';

function foo() {

}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const [leftList, rightList] = splitLists(cleanedLines);

    const occurences = rightList.reduce((acc,cur)=>(acc[cur] = (acc[cur] ?? 0) + 1,acc),{} as {[key:number]:number});

    console.log(occurences);

    const answer = leftList.reduce((acc,cur)=> acc+ (cur * (occurences[cur]??0)),0)

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
