import { runMain, sum, } from "../util.ts";
import { range, toArray } from "../iter_util.ts";

type DiskMap = {size: number, fileId: number|"free"}[]

function parseDiskMap(str:string) {
    const parts = str.split("").map(Number);

    const expanded = parts.map((size,i)=>
                               ({size, fileId: (i%2===0?Math.floor(i/2):"free")})
                              );

    return expanded as DiskMap;
}

function defrag(disk:DiskMap) {
    let cursorStart = 0;
    let cursorEnd = disk.length-1;

    file:
    while(cursorStart < cursorEnd) {
        let start = disk[cursorStart];
        let end = disk[cursorEnd];

        while(end.fileId === 'free')
            end = disk[--cursorEnd];

        while(start.fileId !== 'free') {
            start = disk[++cursorStart];
        }

        if(cursorStart > cursorEnd)
            break;

        let freeCursor = cursorStart;

        while(start.size < end.size || start.fileId !== "free") {
            start = disk[++freeCursor];

            if(freeCursor > cursorEnd || start === undefined) {
                cursorEnd--;
                continue file;
            }
        }

        if(start.size === end.size) {
            [start.fileId, end.fileId] =
                [end.fileId, start.fileId];
            continue;
        }


        disk.splice(freeCursor+1,0,{size: start.size - end.size, fileId: "free"});
        start.size = end.size;

        [start.fileId, end.fileId] = [end.fileId, start.fileId];

        cursorStart--;
        cursorEnd++;
    }

    const {ckSum} = disk.reduce((acc,{fileId,size})=>  // rampant comma operator abuse lmao
                                (
                                    fileId === "free" ? acc.pos += size :
                                    ( acc.ckSum += ( sum(toArray(range(acc.pos,size)), loc=>loc*fileId)),
                                     acc.pos += size )
                              ,acc)
                              ,{pos:0,ckSum:0})

    return {disk,ckSum};

}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const maps = cleanedLines.map(parseDiskMap);

    const defraged = maps.map(defrag);

    console.log(defraged);

    const answer = defraged.at(-1)!.ckSum;

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
