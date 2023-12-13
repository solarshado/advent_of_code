import { runMain, arraysEqual, } from "../util.ts";
import { count, map } from "../iter_util.ts";
import { Grid as AbstractGrid, column, maxX, maxY, parseGrid, renderGrid, } from '../grid_util.ts';

export type Tile = "."|"#";
export type Grid = AbstractGrid<Tile>

export type Mirror = {
    position:number,
    orientation:"H"|"V",
}

export function transpose(g:Grid):Grid {
    return g[0].map((_,i)=>column(g,i));
}

function findMirror(pattern:Grid):Mirror {

    //const horiz = search(pattern);
    //const vert = search(transpose(pattern)).map(m=>({...m, orientation: "V"} as Mirror));

    return search(pattern) ??
        (m=>({...m, orientation: "V"}))(search(transpose(pattern))!);

    function search(pattern:Grid):Mirror|null {
        console.log("findMirror, searching","\n"+renderGrid(pattern));

        const mY = maxY(pattern)
        //const mX = maxX(pattern)

        for(let y = 1; y < mY; ++y) {
            const cur = pattern[y];
            const last = pattern[y-1];

            if(arraysEqual(cur,last)) {
                let valid = true;
                const range = Math.min(y, mY-y);
                console.log("findMirror; checking y",y,"range",range);

                for(let delta = 0; delta < range; ++delta){
                    const next = pattern[y+delta];
                    const prev = pattern[(y-1)-delta];

                    console.log("findMirror; checking delta",delta,"\n+1",next.join(""),"\n-1",prev.join(""))

                    if(!arraysEqual(next,prev)) {
                        valid = false; break;
                    }
                }

                if(valid)
                    return {
                        orientation: "H",
                        position: y,
                    };
            }
        }
        return null;
    }
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim());

    const patterns = cleanedLines.reduce((acc,cur)=> {
        const isBlank = cur == '';

        if(isBlank)
            acc.push([]);
        else
            acc.at(-1)!.push(cur);

        return acc
    }, [[]] as string[][]).filter(p=>p.length!==0);

    console.log(patterns);

    const mirrors = patterns.map(p=>findMirror(parseGrid(p)));

    console.log(mirrors);

    const answer = mirrors.flat().reduce((acc,{orientation,position})=> acc + position * (orientation == "H" ? 100 : 1) ,0)

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
