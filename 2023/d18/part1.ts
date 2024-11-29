import { runMain, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";
import { Grid as AbstractGrid, Direction, Point, addPoints, directionMap, getTileFrom, gridHeight, gridWidth, isPointOnGrid, pointToKey, pointsEqual, renderGrid, setTile } from "../grid_util.ts";
import { pipe } from "../func_util.ts";

export type HexColor = [number,number,number]
export type Instruction = {
    direction:Direction,
    distance:number,
    color:HexColor,
}

export type Tile = "."|"#";
export type Grid = AbstractGrid<Tile>;

export function yeet<T>(t:T):never {
    throw t;
}

export function* pointsBetween(start:Point, end:Point):IterableIterator<Point> {
    const [sx,sy] = start;
    const [ex,ey] = end;

    const delta = directionMap[
        (sy === ey) ? (sx > ex ? "L" : "R") :
        (sx === ex) ? (sy > ey ? "U" : "D") :
        yeet("only axis-aligned point pairs supported!")
    ];

    let cursor = start;

    while(!pointsEqual(cursor, end)) {
        cursor = addPoints(cursor,delta);
        //console.log("pointsBetween",start,end,delta,cursor);
        yield cursor;
    }
}

// nicked from d9p1; number->T
/** @deprecated */
export const pairWise = pairwise;

export function* pairwise<T>(src:T[]):IterableIterator<[T, T]> {
    const len = src.length;
    for(let i = 0 ; i < len - 1; ++i){
        const a = src[i], b = src[i+1];
        yield [a,b] as [T,T];
    }
}

// nicked from d3p1
function getNeighborhoodCoords(grid:Grid, [x,y]:Point) {

    const minX = Math.max(x-1,0);
    const maxX = Math.min(x+1,gridWidth(grid)-1);
    const minY = Math.max(y-1,0);
    const maxY = Math.min(y+1,gridHeight(grid)-1);

    return {minX, maxX, minY, maxY};
}
// nicked, but rewritten
export function getNeighborhood(grid:Grid, p:Point):Point[] {
    const {minX, maxX, minY, maxY} =
        getNeighborhoodCoords(grid,p);

    const ret = [];

    for(let y = minY; y < maxY+1; ++y)
        for(let x = minX; x < maxX+1; ++x) {
            const p = [x,y] as Point;
            if(isPointOnGrid(p,grid))
                ret.push(p);
        }

    return ret;
}

export function parseInstruction(line:string):Instruction {
    console.log("parseInstruction",line);
    const [_,direction,distanceStr,colorStr] = Array.from(/([UDLR]) (\d+) \(#([0-9a-f]{6})\)/.exec(line)!);

    const distance = +distanceStr;
    const [__,...colors] = Array.from(/([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/.exec(colorStr)!).map(c=>parseInt(c,16));
    const color = [colors[0], colors[1],  colors[2]] as HexColor;

    return {direction: direction as Direction, distance, color};
}

export function digInstructions(instructions:Instruction[]):Grid {
    const locs:Point[] = [[0,0]];
    const curLoc = ()=> locs.at(-1)!;

    let left = 0, right = 0, top = 0, bottom = 0;

    for(const {direction,distance} of instructions) {
        const here = curLoc();

        const delta = directionMap[direction].map(dim=>dim*distance) as Point;

        const newLoc = addPoints(here,delta)

        left = Math.min(left, newLoc[0]);
        right = Math.max(right, newLoc[0]);
        top = Math.min(top, newLoc[1]);
        bottom = Math.max(bottom, newLoc[1]);

        locs.push(newLoc);
    }

    console.log("digInstructions; maped points:",locs);

    console.log("corners:",top,bottom,left,right);

    if(top < 0 || left < 0) {
        console.log("shifting points out opg negative space")

        const downDelta = Math.abs(top);
        const rightDelta = Math.abs(left);

        top += downDelta; bottom += downDelta;
        left += rightDelta; right += rightDelta;

        locs.forEach(l=>{
            l[0] += rightDelta;
            l[1] += downDelta;
        });

        console.log("corners:",top,bottom,left,right);
    }

    const maxY = bottom+1;
    const maxX = right+1;

    const grid = [...Array(maxY)]
                    .map(y=> [...Array(maxX)]
                         .map(x=>"." as Tile));

    console.log("new, empty grid:\n"+renderGrid(grid));

    for(const loc of pairWise(locs)) {
        const [first,second] = loc;

        setTile(first, grid, "#")
        setTile(second, grid, "#")

        for(const lineBit of pointsBetween(first,second))
            setTile(lineBit, grid, "#")
    }

    return grid;
}

export function digOutInterior(grid:Grid):Grid {
    const ret = grid.map(l=>[...l]);

    const peekVertically = (p:Point)=>{
        const [above, below] = (["U","D"] as Direction[])
                                    .map(d=>addPoints(directionMap[d],p))
                                    .map(p=>isPointOnGrid(p,grid) ?
                                         getTileFrom(p,grid): ".");

                        console.log("peekAround: from", p, "to",{above,below});
        return {above,below};
    };

    for(const [y,line] of Object.entries(grid)) {
        let inside = false;
        let seenUp = 0
        let seenDown = 0
        for(const [x,cell] of Object.entries(line)) {
            const curPoint = [+x,+y] as Point;
            if(cell == ".") {
                if(inside)
                    setTile(curPoint, ret, "#");
                continue;
            }

            const {above,below} = peekVertically(curPoint);

            if(above == "#")
                inside = !inside;
            /*
            if(above == "#")
                seenUp = (seenUp + 1)%2
            if(below == "#")
                seenDown = (seenDown + 1)%2

            inside =
            */

        }
    }
    return ret;
}

export function wrapToRender(json:string) {
    return `(function(str){
        const p = document.createElement("pre");
        p.innerText = str;
        //document.querySelector("body").appendChild(p)
        document.write("<pre>"+str+"</pre>");
    })(${json});`
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const steps = cleanedLines.map(parseInstruction);

    console.log(steps);

    const perimeter = digInstructions(steps);

    console.log(renderGrid(perimeter));
    console.log(" v v v");

    const lagoon = digOutInterior(perimeter);

    const jsonresult = JSON.stringify(renderGrid(lagoon))

    Deno.writeTextFileSync("output.js",wrapToRender(jsonresult))

    //console.log(JSON.stringify(renderGrid(lagoon)))

    //console.log(renderGrid(lagoon))

    const answer = sum(lagoon, l=>sum(l, t=>t === "#" ? 1 : 0));

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
