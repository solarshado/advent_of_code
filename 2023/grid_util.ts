export type Point = [x:number,y:number];

export function pointsEqual([lx,ly]:Point,[rx,ry]:Point):boolean {
    const ret = lx == rx && ly == ry;
    return ret;
}

export function addPoints([lx,ly]:Point,[rx,ry]:Point):Point {
    return [lx+rx,ly+ry];
}

export function manhattanDistance([lx,ly]:Point, [rx,ry]:Point):number {
    const dist = Math.abs(lx-rx) + Math.abs(ly-ry);
    return dist;
}

export function pointToKey([x,y]:Point):string {
    return x+","+y
}

export type Grid<T> = T[][];

export function parseGrid<T>(lines:string[], callback?:(pos:Point,tile:T)=>void):Grid<T> {
    if(typeof callback == "undefined")
        return lines.map(l=>l.split("") as T[]);
    else {
        return lines.map((l,y)=> l.split("").map((c,x)=>{
            const t = c as T;
            callback([x,y],t);
            return t
        }));
    }
}

export function transpose<T>(grid:Grid<T>):Grid<T> {
    return grid[0].map((_,i)=>column(grid,i));
}

export function rotateGrid90DegCW<T>(grid:Grid<T>):Grid<T> {
    // assume square
    if(grid.length != grid[0].length)
        throw "rotate only implemented for square grids, time to fix that";

    return grid.map((_,y)=>column(grid,y).toReversed());
}

/** @deprecated */
export const maxY = gridHeight;

export function gridHeight(grid:Grid<unknown>):number {
  return grid.length;
}

/** @deprecated */
export const maxX = gridWidth;

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

export function getTileFrom<T>([x, y]:Point, grid:Grid<T>):T {
  return grid[y][x];
}

export function setTile<T>([x, y]:Point, grid:Grid<T>, t:T) {
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

export function renderPoints<T>(grid:Grid<T>, points:Iterable<Point>, tile:T) {
  const copy = grid.map(l => [...l]);
  for (const p of points) {
    setTile(p, copy, tile);
  }
  return renderGrid(copy);
}
