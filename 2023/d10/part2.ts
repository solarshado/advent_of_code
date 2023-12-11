import { runMain, sum, } from "../util.ts";
import { Point, pointsEqual, setTile } from "../grid_util.ts";
import { _getConnections, directionMap, getConnections, getLoc, parseGrid, PipeGrid, Tile, } from './part1.ts';

function findLoop(grid:PipeGrid):Point[] {
    type Loc = {loc:Point, prevLoc?:Point};

    const loopSegments:Loc[] = [{loc: grid.startPos}];

    while(true) {
        const {loc:curLoc, prevLoc}= loopSegments.at(-1)!;

        const tile = getLoc(grid,curLoc)
        //console.log("step",curLoc,tile);

        if(loopSegments.length > 1 && tile == "S")
            break;

        const connections = getConnections(grid,curLoc);

        //console.log("step",connections);

        const next = connections
            .filter(n=>prevLoc != null ? !pointsEqual(n,prevLoc) : true)
            .slice(0,1) // cheat?
            .map(loc=>({
                loc,
                prevLoc: curLoc,
            }));

        loopSegments.push(...next);
    }

    return loopSegments.map(s=>s.loc);
}

function countInsideLoop({tiles:grid, startPos}: PipeGrid, loop: Point[]):number {
    // replace S with a real tile
    {
        const cons = _getConnections(grid,startPos,directionMap)

        for(const [t,f] of Object.entries(directionMap)) {
            const maybe = f(startPos);
            if(cons.length === maybe.length && cons.every((c,i)=>pointsEqual(c,maybe[i]))) {
                console.log("replacing S with",t);
                setTile(startPos,grid,t);
            }
        }
    }

    const keyFunc = (x:number,y:number)=>x+","+y;

    const edges = new Set(loop.map(([x, y]) => keyFunc(x, y)));

    const toggleState = (s:{prevState:"O"|"I"})=>
                s.prevState = s.prevState == "O" ? "I" : "O";

    //const inside:Point[] = [];

    const z1 = grid.map((r,y)=>{
        return r.reduce((acc,cur,x)=>{

            if(!edges.has(keyFunc(x,y))) {
                if(acc.prevState == "I"){
                    ++acc.count;
                }
            }
            else if(cur === "-" || cur === ".") {
                // "." shouldn't happen
                // no-op / fallthrough
                //return acc;
            }
            else if(cur === "|") {
                toggleState(acc);
            }
            else if(cur === "F" || cur === "L") {
                //toggleState(acc);
                acc.prevCorner = cur;
            }
            else {
                if((cur === "J" && acc.prevCorner === "F") ||
                   (cur === "7" && acc.prevCorner === "L"))
                    {
                        toggleState(acc);
                        acc.prevCorner = ".";
                    }
            }

            //if(acc.prevState == "I")
            //    inside.push([x,y]);

            return acc;
        },{prevState:"O" as "O"|"I", prevCorner: "." as Tile, count:0}).count
    });

    //console.log(renderPoints(grid,inside,"I"));

    return sum(z1);
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const grid = parseGrid(cleanedLines);

    //console.log(renderGrid(grid.tiles))

    const loop = findLoop(grid);

    //console.log(renderPoints(grid.tiles,loop));

    const answer = countInsideLoop(grid,loop);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);

/*
export async function _main(lines:string[]) {
    //for(const {input,ans} of examples.slice(1,2)) {
    for(const {input,ans} of examples) {
        const ret = await _main(input.split("\n"));
        console.log("example",ret==ans?"passed":"failed");
    }
}

const examples:{input:string, ans:number}[] = [
    // redacted
];
*/
