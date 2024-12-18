import { runMain, sum, } from "../util.ts";
import { map, toArray } from "../iter_util.ts";
import * as iu from "../iter_util.ts";
import { HexColor, Instruction, yeet } from './part1.ts';
import { Direction, Point, } from "../grid_util.ts";
import * as gu from "../grid_util.ts";

type Line = Readonly<[[sx:number,sy:number],[ex:number,ey:number]]>;

export function parseInstruction(line:string):Instruction {
    const [_,___,____,distanceStr,dirStr] = Array.from(/([UDLR]) (\d+) \(#([0-9a-f]{5})([0-9a-f])\)/.exec(line)!);

    const distance = parseInt(distanceStr,16);
    const color = [0,0,0] as HexColor;

    const dirNum = +dirStr;
    const direction =
        dirNum === 0 ? "R" :
        dirNum === 1 ? "D" :
        dirNum === 2 ? "L" :
        dirNum === 3 ? "U" :
        yeet("bad direction:"+dirNum);

    return {direction: direction as Direction, distance, color};
}

function* drawLines(instructions:Instruction[]):IterableIterator<Line> {
    let cursor:Point = [0,0];

    for(const {distance, direction,} of instructions) {
       const start:Point = [...cursor];

       const delta = gu.directionMap[direction].map(dim=>dim*distance) as Point;

       const end = gu.addPoints(start,delta);

       yield [start,end] as const;

       cursor = end;
    }
}

type GridLines = {xs:number[], ys:number[]}

function findGridLines(points:Iterable<Point>):GridLines {
    const xs = new Set<number>();
    const ys = new Set<number>();

    for(const [x,y] of points) {
        xs.add(x);
        ys.add(y);
    }

    return {
        xs: [...xs].sort((a,b)=>a-b),
        ys: [...ys].sort((a,b)=>a-b)
    };
}

type GridCell = {
    topLeft:Point,
    bottomRight:Point,
    closedSides:{ [key in Direction]: boolean },
    isInLagoon:boolean|null,
    neighbors:{ [key in Direction]: GridCell|null }
}

/** @returns corners in clockwise order from top left */
function getCorners({topLeft:[left,top], bottomRight:[right,bottom]}:GridCell):Point[] {
    return [
        [left,top],
        [right,top],
        [right,bottom],
        [left,bottom]
    ];
}

/** @returns edges with points in order clockwise from top left */
function getEdges(g:GridCell):{ [D in Direction]: Line} {
    const [tl,tr,br,bl] = getCorners(g);
    return {
        U: [tl,tr],
        R: [tr,br],
        D: [br,bl],
        L: [bl,tl]
    };
}

/** @returns the same line, possibly reversed to ensure its `start` is closer to `0,0` */
function normalizeEdge(line:Line):Line {
    const [start,end] = line;
    const [sx,sy] = start;
    const [ex,ey] = end;

    return (sx < ex) || (sy < ey) ? line : [end,start];
}

function isLineSegmentOf(smol:Line, lorge:Line):boolean {
    let [[ssx,ssy],[sex,sey]] = smol;
    let [[lsx,lsy],[lex,ley]] = lorge;

    if(ssx === sex && sex === lsx && lsx === lex) {
        if(lsy > ley)
          [lsy, ley] = [ley, lsy]
        if(ssy > sey)
          [ssy, sey] = [sey, ssy]
        return ssy >= lsy && sey <= ley;
    }
    else if (ssy === sey && sey === lsy && lsy === ley) {
        if(lsx > lex)
            [lsx, lex] = [lex, lsx]
        if(ssx > sex)
            [ssx, sex] = [sex, ssx]
        return ssx >= lsx && sex <= lex;
    }
    else
        return false;
}

function burp<T>(val:T, label?:string):T {
    if(label)
        console.log(label+": ",val);
    else
        console.log(val);
    return val;
}

function buildGridCells({xs,ys}:GridLines, walls:Line[]):GridCell[][] {
    const wallKeyFunc = ([[sx,sy],[ex,ey]]:Line) =>
        sx === ex ? "x->"+sx :
        sy === ey ? "y->"+sy :
        yeet("found non-axis-parallel line!");

    // axis+offest -> lines on that 'geodesic'
    const wallLookup = new Map<string,Line[]>(Object.entries(walls.reduce((acc,cur)=>{
        const key = wallKeyFunc(cur);

        const ary =
            (acc[key] === undefined) ?
            acc[key] = [] :
            acc[key];

        ary.push(cur);

        return acc;
    }, {} as { [key:string]:Line[] } )));

    const cells:GridCell[][] = [];

    for(let ix = 1; ix < xs.length; ++ix) {
        const row:typeof cells[number] = [];
        cells.push(row);
        for(let iy = 1; iy < ys.length; ++iy) {

            const cell:typeof row[number] = {
                topLeft:[xs[ix - 1],ys[iy - 1]],
                bottomRight:[xs[ix],ys[iy]],
                isInLagoon: null,
                neighbors: {
                    U: null, D: null,
                    L: null, R: null
                },
                closedSides: {
                    U: false, D: false,
                    L: false, R: false
                },
            };

            const {neighbors} = cell;

            const neighU = cells[ix-1]?.[iy-2] ?? null;
            if(neighU !== null) {
                neighbors.U = neighU;
                neighU.neighbors.D = cell;
            }

            const neighL = cells[ix-2]?.[iy-1] ?? null;
            if(neighL !== null) {
                neighbors.L = neighL;
                neighL.neighbors.R = cell;
            }

            const edges = getEdges(cell as GridCell);

            for(const dir of gu.DIRECTIONS) {
                // our edges will usually be just a
                // *segment* of an initial wall!
                const edge = edges[dir];

                const key = wallKeyFunc(edge);
                const walls = wallLookup.get(key)!;

                cell.closedSides[dir] = walls.some(w=>isLineSegmentOf(edge,w));
            }

            // easy early test
            if((ix === 1 && !cell.closedSides.L ||
                iy === 1 && !cell.closedSides.U))
                cell.isInLagoon = false;

            row.push(cell);
        }
    }

    return cells;
}

function processCells(cells:GridCell[][]) {
    const startCell = cells[0].find(c=> c.isInLagoon === false);

    if(!startCell)
        throw "can't find a known-outside cell!"

    //const cellCount = sum(cells, l=> l.length);

    const seenCells = new Set<GridCell>();

    const checkSides = (cell:GridCell)=>
            gu.DIRECTIONS.reduce((acc,cur)=> {
                (cell.closedSides[cur] ? acc.closedSides : acc.openSides).push(cur)
                return acc;
            }, {openSides:[] as gu.Direction[], closedSides:[] as gu.Direction[]})

    const outsideQueue = [startCell];
    const insideQueue:GridCell[] = [];

    //let outSteps = 0;
    while(outsideQueue.length > 0) {
        const cur = outsideQueue.shift()!;

        const {neighbors,isInLagoon} = cur;

        const {openSides,closedSides} = checkSides(cur);

        //outSteps += 1
        //if(outSteps % 10 === 0) {
        //  console.log("visiting outside cell, steps =",outSteps,",",outsideQueue.length,"in queue -- visited",seenCells.size,"/",cellCount);
        //  console.log(/*"cur",cur,*/"openSides",openSides,"closedSides",closedSides);
        //}

        seenCells.add(cur)

        // found a wall? our job is done here
        if(closedSides.length > 0) {
            const [dir] = closedSides;
            const innerNeighbor = neighbors[dir]!;
            console.log("found cell inside!"/*,innerNeighbor*/);
            innerNeighbor.isInLagoon = !isInLagoon;
            insideQueue.push(innerNeighbor);
            break;
        }

        for(const dir of openSides) {
            const neigh = neighbors[dir];
            if(neigh == null || seenCells.has(neigh))
                continue;

            neigh.isInLagoon = isInLagoon;

            outsideQueue.unshift(neigh);
        }
    }

    if(insideQueue.length === 0)
        throw "failed to find inside cell!"

    const innerSpace = {
        add(cell:GridCell) {
            const {
                topLeft: [left, top],
                bottomRight: [right, bottom],
            } = cell;
            const edges = getEdges(cell);

            const cellKey = `[[${left},${top}],[${right},${bottom}]]`;

            if( !this.rects.has(cellKey) ) {
                const area = (bottom + -top + -1)*(right + -left + -1);
                this.rects.set(cellKey,Math.max(0,area));
            }

            for(const dir of gu.DIRECTIONS) {
                const edge = normalizeEdge(edges[dir]);

                const edgeKey = JSON.stringify(edge); // works well enough

                if( this.edges.has(edgeKey) )
                    continue;

                const [[esx,esy],[eex,eey]] = edge;
                const edgeLen =
                    (esx === eex) ?
                    (eey + -esy + -1) :
                    (eex + -esx + -1);

                this.edges.set(edgeKey, Math.max(0,edgeLen));

                for(const [x,y] of edge)
                    this.corners.add(`[${x},${y}]`)
            }
        },

        get total() {
            return iu.reduce(
                iu.concat(this.rects.values(), this.edges.values()),
                (l,r)=>l+r,
                this.corners.size);
        },

        rects: new Map<string,number>(),
        edges: new Map<string,number>(),
        corners: new Set<string>(),
    } as const;

    //let inSteps = 0;
    while(insideQueue.length > 0) {
        const cur = insideQueue.shift()!;

        if(seenCells.has(cur))
            continue;

        const {neighbors,isInLagoon} = cur;

        if(!isInLagoon)
            throw "non-interior cell made it into 'insideQueue'!"

        const {openSides} = checkSides(cur);

        //if(++inSteps /*% 10 === 0*/)
            //console.log("visiting inside cell, step,",inSteps,",",insideQueue.length,"in queue -- visited",seenCells.size,"/",cellCount);

        seenCells.add(cur)

        innerSpace.add(cur);

        for(const dir of openSides) {
            const neigh = neighbors[dir];
            if(neigh == null || seenCells.has(neigh))
                continue;

            neigh.isInLagoon = isInLagoon;

            insideQueue.push(neigh);
        }
    }

   return innerSpace.total;
}

function renderGrid(grid:GridCell[][]):string {
    const side = (b:boolean) => b ? "#" : ".";

    const blob = grid.map((line,y)=>{
        const l = line.map(({topLeft,bottomRight,closedSides,isInLagoon},x)=>({
            topLeft,bottomRight,closedSides,isInLagoon,
            neededWidth: Math.max( ...[topLeft,bottomRight].flat().map(n=>n.toString().length)) + 6,
            render(width:number):string[] {
                const {D,L,R,U} = closedSides;
                const [u,d,l,r] = [U,D,L,R].map(side);
                const lag =
                    isInLagoon === true ? "~~~" :
                    isInLagoon === false ? "xxx": "???";
                return [
                    "+"+u.repeat(width)+"+",
                    l + ("["+topLeft[0]+",").padEnd(width) + r,
                    l + (" "+topLeft[1]+"]").padEnd(width) + r,

                    l + (`[${y},${x}]`).padStart(width/2+3).padEnd(width)  +r,
                    l + (lag).padStart(width/2+3).padEnd(width)  +r,

                    l + ("["+bottomRight[0]+",").padStart(width) + r,
                    l + (" "+bottomRight[1]+"]").padStart(width) + r,
                    "+"+d.repeat(width)+"+",
                ];
            }
        }));
        return l;
    });

    const maxW = Math.max(...blob.flat().map(b=>b.neededWidth));

    const out = blob.map(line=>{
        const cells = line.map(c=>c.render(maxW));
        const rows = cells.reduce((l,r)=>(r.forEach((s,i)=> l[i] += s ),l))

        return rows.join("\n");
    }).join("\n");

    const out2 = blob.map(row=>
                          row.map(
                              c=>c.render(maxW)
                          )
                         .flat()
                         )
                         .reduce((l,r)=>(r.forEach((s,i)=> l[i] += s ),l))
                         .join("\n");

    return out2;
}

export async function main(inputLines:string[]) {
    const cleanedLines = inputLines.map(l=>l.trim()).filter(l=>l!='');

    const instructions = cleanedLines.map(parseInstruction);

    //console.log("instructions:",instructions);

    const lines = toArray(drawLines(instructions));

    const gridLines = findGridLines(map(lines,([s,_])=>s));

    //console.log("gridLines",gridLines);

    const gridCells = buildGridCells(gridLines,lines);

    const cellCount = sum(gridCells, l=> l.length);

    console.log("grid cell count",gridCells.length,"x",gridCells[0].length,cellCount)

    const answer = processCells(gridCells);

    //console.log(renderGrid(gridCells));

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
