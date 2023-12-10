import { runMain, sum, } from "../util.ts";
import { count } from "../iter_util.ts";
import { map } from "../iter_util2.ts";
import { PipeGrid, Point, _getConnections, _getLoc, parseGrid, pointsEqual, directionMap, DirectionMap, getLoc, getConnections, Tile,  } from './part1.ts';

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

const getTileFrom = <T>([x,y]:Point,wallGrid:T[][])=> wallGrid[y][x];
const setTile = <T>([x,y]:Point,wallGrid:T[][],t:T)=> wallGrid[y][x]= t;

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

    //const isUpwardsCoener = (t:Tile)=> t === "L" || t === "J";
    //const isDownwardsCoener = (t:Tile)=> t === "F" || t === "7";

    const inside:Point[] = [];

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

            if(acc.prevState == "I")
                inside.push([x,y]);

            return acc;
        },{prevState:"O" as "O"|"I", prevCorner: "." as Tile, count:0}).count
    });

    //console.log(renderPoints(grid,inside,"I"));

    return sum(z1);
}

function _countInsideLoop({tiles:grid}: PipeGrid, loop: Point[]):number {
    const maxX = grid[0].length;
    const maxY = grid.length;

    const keyFunc = (x:number,y:number)=>x+","+y;
    const keyFunc2 = ([x,y]:Point)=>keyFunc(x,y)
    const isEdge = ([x,y]:Point)=>                    
                                y == 0 || y == maxY-1 ||
                                x == 0 || x == maxX-1;

    const borders = new Set(loop.map(keyFunc2));

    const toCheck:Point[] = [];
    const outside = new Set<string>();

    /// that paren hack is gross, but...
    const wallGrid = grid.map((r,y)=>
                             r.map((_,x)=>borders.has(keyFunc(x,y))?"#":
                                            isEdge([x,y])?(outside.add(keyFunc(x,y)),"O"):
                                            (toCheck.push([x,y])," ")
                                  ));

    type Tile = typeof wallGrid[0][0];

    const connectivityMap:DirectionMap<Tile> = {
        "#": directionMap["."],
        " ": directionMap["S"],
        "O": directionMap["S"]
    };

    const getTile = ([x,y]:Point)=> wallGrid[y][x];
    const setTile = ([x,y]:Point,t:Tile)=> wallGrid[y][x]= t;

    const updateCell = ([x,y]:Point):Tile=>{
        const t = getTile([x,y]);
        if(t== "#" || t== "O")
            return t;

        const neighs = _getConnections(wallGrid,[x,y],connectivityMap).map(keyFunc2)

        if(neighs.some(n=>outside.has(n)))
           return "O";

       return " ";
    };

    let lastUpdate = 0;
    while(toCheck.length > 0) {
        const cur = toCheck.shift()!;

        const t = getTile(cur);
        const tNew = updateCell(cur);

        if(tNew == t) {
            toCheck.push(cur);
            ++lastUpdate;
        }
        else {
            lastUpdate = 0;
            setTile(cur,tNew);
            if(tNew === "O")
                outside.add(keyFunc2(cur));
        }

        // is +2 necessary? to tired to care
        if(lastUpdate > toCheck.length + 2)
            break;
    }

    return toCheck.length;
}

const renderGrid = (g:string[][])=>g.map(l=>l.join("")).join('\n');
const renderPoints = (g:string[][],loop:Point[], char:string="*") => {
    const copy = g.map(l=>[...l]);
    for(const p of loop) {
        setTile(p,copy,char)
    }
    return renderGrid(copy)
};

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const grid = parseGrid(cleanedLines);

    //console.log(renderGrid(grid.tiles))

    const loop = findLoop(grid);

    //console.log(renderPoints(grid.tiles,loop));

    const answer = countInsideLoop(grid,loop);

    console.log(answer);
    //return answer;
}

export async function _main(lines:string[]) {
    //for(const {input,ans} of examples.slice(1,2)) {
    for(const {input,ans} of examples) {
        const ret = await _main(input.split("\n"));
        console.log("example",ret==ans?"passed":"failed");
    }
}

if(import.meta.main)
    await runMain(main);

const examples:{input:string, ans:number}[] = [
    {input:
`...........
.S-------7.
.|F-----7|.
.||.....||.
.||.....||.
.|L-7.F-J|.
.|..|.|..|.
.L--J.L--J.
...........
`,ans:4},
    {input:
`..........
.S------7.
.|F----7|.
.||....||.
.||....||.
.|L-7F-J|.
.|..||..|.
.L--JL--J.
..........
`,ans:4},
    {input:
`.F----7F7F7F7F-7....
.|F--7||||||||FJ....
.||.FJ||||||||L7....
FJL7L7LJLJ||LJ.L-7..
L--J.L7...LJS7F-7L7.
....F-J..F7FJ|L7L7L7
....L7.F7||L7|.L7L7|
.....|FJLJ|FJ|F7|.LJ
....FJL-7.||.||||...
....L---J.LJ.LJLJ...
`,ans:8},
    {input:
`FF7FSF7F7F7F7F7F---7
L|LJ||||||||||||F--J
FL-7LJLJ||||||LJL-77
F--JF--7||LJLJ7F7FJ-
L---JF-JLJ.||-FJLJJ7
|F|F-JF---7F7-L7L|7|
|FFJF7L7F-JF7|JL---7
7-L-JL7||F7|L7F-7F7|
L.L7LFJ|||||FJL7||LJ
L7JLJL-JLJLJL--JLJ.L
`,ans:10},
];
