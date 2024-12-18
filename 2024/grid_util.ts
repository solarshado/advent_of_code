import { yeet } from './util.ts';

export type Point = readonly [x:number,y:number];

const _PointMultitonStore:Map<string,Point> = new Map();
function _PointMultitonStoreKeyFunc(x:number,y:number):string {
    return x+','+y;
}

// like "singleton", but there's multiples, geddit? 
// don't blame me: https://en.wikipedia.org/wiki/Multiton_pattern
export function getPointMultiton(p:Point):Point
export function getPointMultiton(x:number, y:number):Point

export function getPointMultiton(xOrP:number|Point, maybeY?:number):Point {

    const [x,y] = Array.isArray(xOrP) ? xOrP as Point :
                    maybeY === undefined ? yeet("bad params") :
                    [xOrP,maybeY] as Point;

    const key = _PointMultitonStoreKeyFunc(x,y);

    const had = _PointMultitonStore.get(key);
    if(had != undefined)
        return had;

    const made = [x,y] as const;
    _PointMultitonStore.set(key,made);
    return made;
}

export function pointsEqual([lx,ly]:Point,[rx,ry]:Point):boolean {
    const ret = lx == rx && ly == ry;
    return ret;
}

export function addPoints([lx,ly]:Point,[rx,ry]:Point):Point {
    return [lx+rx,ly+ry];
}

export function subtractPoints([lx,ly]:Point,[rx,ry]:Point):Point {
    return [lx-rx,ly-ry];
}

export function multiplyPoint([x,y]:Point, factor:number):Point {
    return [x*factor, y*factor];
}

export function pointModulo(n:Point, mod:Point):Point {
    return [
        n[0] % mod[0],
        n[1] % mod[1]
    ];
}

export function pointBinOp(l:Point, r:Point, op:(l:number,r:number)=>number):Point {
    return [
        op(l[0], r[0]),
        op(l[1], r[1])
    ];
}

export function manhattanDistance([lx,ly]:Point, [rx,ry]:Point):number {
    const dist = Math.abs(lx-rx) + Math.abs(ly-ry);
    return dist;
}

/** @deprecated don't roll your own "uniquePoint" impl */
export function pointToKey([x,y]:Point):string {
    return x+","+y
}

// Grid stuff

export type Grid<T> = T[][];

export function parseGrid<T extends string>(lines:string[]):Grid<T>;

export function parseGrid<T>(lines:string[], mapper:(rawTile:string)=>T):Grid<T>;

export function parseGrid<T>(lines:string[], mapper?:(rawTile:string)=>T):Grid<T> {
    if(typeof mapper === "undefined")
        return lines.map(l=>l.split("") as T[]);
    else
        return lines.map(l=> l.split("").map(c=>mapper(c)));
}

export function genGrid<T=".">(width:number, height:number, tile="."):Grid<T> {
    return Array(height).fill(Array(width).fill(tile));
}

export function transpose<T>(grid:Grid<T>):Grid<T> {
    return grid[0].map((_,i)=>column(grid,i));
}

export function rotateGrid90DegCW<T>(grid:Grid<T>):Grid<T> {
    // assume square
    const w = gridWidth(grid), h = gridHeight(grid);
    if(w != h)
        throw "rotate only implemented for square grids, time to fix that";

    return grid.map((_,y)=>column(grid,y).toReversed());
}

export function gridHeight(grid:Grid<unknown>):number {
  return grid.length;
}

export function gridWidth(grid:Grid<unknown>):number {
  return grid[0].length;
}

export function isPointOnGrid([x,y]:Point, grid:Grid<unknown>):boolean {
    return (
        y >= 0 &&
        x >= 0 &&
        y < gridHeight(grid) &&
        x < gridWidth(grid)
    );
}

export function column<T>(grid:Grid<T>, x:number) {
    return grid.map(line=>line[x]);
}

export function isAPoint(ary:unknown):ary is Point {
    return Array.isArray(ary) &&
        ary.length === 2 &&
        typeof ary[0] === "number" &&
        typeof ary[1] === "number";
}

/** @deprecated use other param order */
export function getTileFrom<T>([x, y]:Point, grid:Grid<T>):T;
export function getTileFrom<T>(grid:Grid<T>, [x, y]:Point,):T;

export function getTileFrom<T>(first:Point|Grid<T>, second:Point|Grid<T>):T {
    const [grid, [x,y]] =
        isAPoint(second) ?
        //(first.length === 2 && typeof first[1] === "number") ?
        [first as Grid<T>,second] :
        [second,first as Point];

  return grid[y][x];
}

/** @deprecated use other param order */
export function setTile<T>([x, y]:Point, grid:Grid<T>, t:T):void;
export function setTile<T>(grid:Grid<T>, [x, y]:Point, t:T):void;

export function setTile<T>(first:Point|Grid<T>, second:Point|Grid<T>, t:T):void {
    const [grid, [x,y]] =
        isAPoint(second) ?
        //(first.length === 2 && typeof first[1] === "number") ?
        [first as Grid<T>,second] :
        [second,first as Point];

  grid[y][x] = t;
}

export function findAll<T>(grid:Grid<T>, tile:T):Point[] {
    return grid.flatMap((line, y) =>
                        line.reduce((acc, cur, x) =>{
                            if(cur == tile)
                                acc.push([x, y]);
                            return acc;
                        }, [] as Point[])
                       );
}

export function renderGrid<T>(grid:Grid<T>) {
  return grid.map(l => l.join("")).join('\n');
}

export function renderPoints<T>(grid:Grid<T>, points:Iterable<Point>, tile:string) {
  const copy = (grid as Grid<T|string>).map(l => [...l]);
  for (const p of points) {
    setTile(copy, p, tile);
  }
  return renderGrid(copy);
}

export const DIRECTIONS = ["U","D","L","R"] as const;
export type Direction = typeof DIRECTIONS[number];

export const directionMap:{ [key in Direction]: Point } = {
    U: [0,-1],
    D: [0,+1],
    L: [-1,0],
    R: [+1,0],
};

export const turnMap/*:{ [key in Direction]: { [key in "L"|"R"]: Direction} }*/ = {
    U: {L: "L",R: "R"},
    D: {L: "R",R: "L"},
    L: {L: "D",R: "U"},
    R: {L: "U",R: "D"},
} as const;

export function areOppositeDirections(l:Direction, r:Direction):boolean {
    return (
        (l === "U" && r === "D") ||
        (l === "D" && r === "U") ||
        (l === "L" && r === "R") ||
        (l === "R" && r === "L")
    );
}

// todo overload with optional grid to constrain to
export function getManhattanNeighborhood([x,y]:Point):Point[] {
    return [
        [x+ 0,y+ -1],
        [x+ 0,y+ +1],
        [x+ -1,y+ 0],
        [x+ +1,y+ 0],
    ];
}

// from 2023d21p1

/// wtf? rename or rework this...
export function getNeighborhoodCoords(grid:Grid<unknown>, [x,y]:Point) {
    const minX = Math.max(x-1,0);
    const maxX = Math.min(x+1,gridWidth(grid)-1);
    const minY = Math.max(y-1,0);
    const maxY = Math.min(y+1,gridHeight(grid)-1);

    return {minX, maxX, minY, maxY};
}
export function getNeighborhood(grid:Grid<unknown>, p:Point):Point[] {
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

// from 2023d22p1

export type Tripple = [number,number,number];
export class Point3D {
    private constructor(
        public readonly x:number,
        public readonly y:number,
        public readonly z:number,
    ) { }

    static for([x,y,z]:Tripple):Point3D;
    static for(x:number, y:number, z:number):Point3D;
    static for(xOrTup:number|Tripple, y?:number, z?:number):Point3D {
        const tripple = ( Array.isArray(xOrTup) ?
            xOrTup:
            y === undefined || z === undefined ?
            yeet("bad args! "+xOrTup+y+z):
            [xOrTup,y,z] as const)
        const key = tripple.join(",");

        if(!Point3D.store.has(key))
            Point3D.store.set(key,new Point3D(...tripple));

        return Point3D.store.get(key)!;
    }
    private static store:Map<string,Point3D> = new Map();

    toString() {
        return `Point3D {x: ${this.x}, y: ${this.y}, z: ${this.z}}`
    }

    public add(other:Point3D):Point3D;
    public add(other:Tripple):Point3D;
    public add(other:Point3D|Tripple):Point3D {
        const [x,y,z] = Array.isArray(other) ?
                        other :
                        [other.x,other.y,other.z];

        return Point3D.for(this.x+x, this.y+y, this.z+z);
    }
}
