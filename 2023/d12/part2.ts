import { runMain, sum, } from "../util.ts";
import { repeat } from '../iter_util.ts';
import { memozie } from "../func_util.ts";
import { PuzzleLine, Tile, parsePuzzleLine } from './part1.ts';

function unfold({groups,record}:PuzzleLine):PuzzleLine {
    const newGroups= [...repeat(groups,5)].flat();
    const newRecord =
        [...repeat(record,5)].reduce((acc,cur)=> (acc.length === 0 ? acc.push(...cur) : acc.push("?", ...cur) ,acc),[]);
    //console.log("unfold groups",groups,"->",newGroups)
    //console.log("unfold record",record.join(""),"->",newRecord.join(""))
    return {
        groups: newGroups,
        record: newRecord
    }
}

function countPossibleSolutions({groups,record:tiles}:PuzzleLine, doLog=false):number {
    const log = doLog ?
        (...z:unknown[]) => console.log(...z) :
        (..._:unknown[]) => {};

    const _search = first_search;

    const search = memozie(_search,
                           (tiles,groups,prevT) =>
                                [tiles.join(""),groups.join(),prevT].join("|"));

    const r = search(tiles,groups,'.');

    //const r = search(0,0,0);

    // deno-lint-ignore no-debugger
    //debugger;
    return r;

    /*
    // doesn't quite work, have yet to figure out why; misses some cases
    function new_search(tileIdx:number, groupIdx:number, groupProgress:number):number {
        //log("search",tiles.join(""),groups,prevT);

        const curT = tiles[tileIdx];
        const curG = groups[groupIdx];

        const tilesLeft = tiles.length - (tileIdx )
        const groupsLeft = groups.length - (groupIdx ) // no +1?
        const groupProgressLeft = curG - groupProgress;

        const restOfGroupPreview = tiles.slice(tileIdx,tileIdx+groupProgressLeft)
        const canFinishGroup =
            restOfGroupPreview.length == groupProgressLeft &&
            tiles[tileIdx+groupProgressLeft] !== "#" &&
            restOfGroupPreview.every(t=>t==="#"||t==="?")

        const finishGroup = ()=>search(tileIdx+groupProgressLeft+1,groupIdx+1,0);

        log("Search1",tileIdx,groupIdx,groupProgress)
        log("search2",tilesLeft,groupsLeft,groupProgressLeft)
        log("search3",tiles.map((t,i)=> i === tileIdx ? '['+t+']' : t).join(""),
                       groups.map((g,i)=> i === groupIdx ? '['+g+']' : g).join());
        log("search4",canFinishGroup, restOfGroupPreview.join(""));

        // deno-lint-ignore no-debugger
        //debugger;

        if(groupsLeft < 1)
            return (tilesLeft < 1 || !tiles.slice(tileIdx).some(t=>t==="#")) ? 1 : 0;
        else if(tilesLeft < 1)
            return 0;

        if(curT === "#") {
            if(!canFinishGroup)
                return 0;

            const r = finishGroup();
            //log("search; got",r,"from",restT.join(""),nextG,curT)
            return r
        }
        else if(curT === ".") {
            if(canFinishGroup)
                return finishGroup();
            else if(groupProgressLeft > 0 && groupProgressLeft < curG)
                return 0;

            while(tiles[tileIdx] === ".")
                ++tileIdx;

            const r = search(tileIdx, groupIdx, 0);
            //log("search; got",r,"from",restT.join(""),restG,curT)
            return r
        }
        else if(curT === "?") {
            if(groupProgress > 0)
                return canFinishGroup ? finishGroup() : 0;

            const tryStartGroup = search(tileIdx+1,groupIdx,1);
            const tryWait = search(tileIdx+1,groupIdx,0);

            return tryStartGroup + tryWait;
        }
        else throw "Bad Tile!";
    }
    */

    function first_search(tiles:Tile[], groups:number[], prevT:Tile):number {
        log("search",tiles.join(""),groups,prevT);

        if(groups.length === 0 || (groups.length === 1 && groups[0] === 0))
            return (tiles.length === 0 || tiles.every(t=>t==="."||t==="?")) ? 1 : 0;
        else if(tiles.length === 0)
            return 0;

        const [curT,...restT] = tiles;
        const [curG,...restG] = groups;

        if(curT === "#") {
            if(curG === 0)
                return 0;

            const nextG = [curG - 1, ...restG];

            const r = search(restT, nextG, curT);
            log("search; got",r,"from",restT.join(""),nextG,curT)
            return r
        }
        else if(curT === ".") {
            if(prevT === "#" && curG !== 0)
                return 0;

            while(restT[0] === ".")
                restT.shift();

            const nextG =
                curG === 0 ?
                restG :
                [curG, ...restG];

            const r = search(restT, nextG, curT);
            log("search; got",r,"from",restT.join(""),restG,curT)
            return r
        }
        else if(curT === "?") {
            const tilesL = ["#",...restT] as Tile[]
            const tilesR = [".",...restT] as Tile[]
            const l = search(tilesL,groups,prevT);
            const r = search(tilesR,groups,prevT);

            log("search; got",l,"from",tilesL.join(""),groups,prevT)
            log("search; got",r,"from",tilesR.join(""),groups,prevT)

            return l+r;
        }
        else throw "Bad Tile!";
    }
}

export async function main(lines:string[]) {

    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const puzzles = cleanedLines.map(parsePuzzleLine);

    //console.log(puzzles);
    //
    const puzzles2 = puzzles.map(unfold);

    //console.log(puzzles2[0])

    const solutions = puzzles2
                   //     .slice(5,6)
                        .map((p,i)=> {
                                 console.log("starting puzzle",i)
                                 const r = countPossibleSolutions(p)
                                 console.log("finished puzzle",i,"got",r)
                                 return r;
                             });

    //console.log("solutions",solutions);
    const answer = sum(solutions);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
