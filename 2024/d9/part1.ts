import { runMain, } from "../util.ts";
import { repeat } from "../iter_util.ts";

export type DiskMap = (number|".")[];

export function parseDiskMap(str:string) {
    const parts = str.split("").map(Number);

    // would choke on zero-length files....
    const expanded = parts.flatMap((n,i)=>Array.from(repeat(i%2===0?Math.floor(i/2):".",n)));

    return expanded as DiskMap;
}

function defrag(disk:DiskMap) {
    let cursorStart = 0;
    let cursorEnd = disk.length-1;

    let ckSum = 0;

    while(cursorStart < cursorEnd) {
        let start = disk[cursorStart];
        let end = disk[cursorEnd];

        while(end === '.')
            end = disk[--cursorEnd];

        while(start !== '.') {
            ckSum += start * cursorStart;

            start = disk[++cursorStart];
        }

        if(cursorStart > cursorEnd)
            break;

        [disk[cursorStart], disk[cursorEnd]] =
        [disk[cursorEnd], disk[cursorStart]];
    }


    let start = disk[cursorStart];
    while(start !== ".") {
        ckSum += start * cursorStart;
        start = disk[++cursorStart];
    }

    return {disk,ckSum};
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const maps = cleanedLines.map(parseDiskMap);

    //console.log(maps);

    const defraged = maps.map(defrag);

    console.log(defraged);

    const answer = defraged[0].ckSum;

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
