export type Point = [x:number,y:number];

export function pointsEqual([lx,ly]:Point,[rx,ry]:Point):boolean {
    const ret = lx == rx && ly == ry;
    return ret;
}

export function manhattanDistance(l:Point, r:Point):number {
    const [lx,ly] = l;
    const [rx,ry] = r;
    const dist = Math.abs(lx-rx) + Math.abs(ly-ry);
    return dist;
}

export function pointToKey([x,y]:Point):string {
    return x+","+y
}

export type Grid<T=string> = T[][];

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

export function maxY(grid:Grid<unknown>):number {
  return grid.length;
}

export function maxX(grid:Grid<unknown>):number {
  return grid[0].length;
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

export function renderGrid<T>(g:Grid<T>) {
  return g.map(l => l.join("")).join('\n');
}

export function renderPoints<T>(g:Grid<T>, loop:Point[], char:T) {
  const copy = g.map(l => [...l]);
  for (const p of loop) {
    setTile(p, copy, char);
  }
  return renderGrid(copy);
}
