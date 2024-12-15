import { runMain, splitArray, } from "../util.ts";
import * as gu from "../grid_util.ts";

export type Tile = "#"|"O"|"."|"@";
export type Grid = gu.Grid<Tile>;

export function mapDirection(char:string):gu.Point {
    switch(char[0]) {
        case "^": return gu.directionMap.U;
        case ">": return gu.directionMap.R;
        case "<": return gu.directionMap.L;
        case "v": return gu.directionMap.D;
        default: throw "bad direction: "+char[0];
    }
}

export function runSim(grid:gu.Grid<Tile>, directions:gu.Point[]):gu.Grid<Tile> {
    let robotPos = gu.findAll(grid, "@")[0];
    const curGrid = grid.map(c=>[...c]) as gu.Grid<Exclude<Tile,"@">>;
    gu.setTile(robotPos, curGrid, ".");

    function tryMoveBox(boxPos:gu.Point, direction:gu.Point):boolean {
        const tryDestLoc = gu.addPoints(boxPos,direction);
        const tryDestTile = gu.getTileFrom(tryDestLoc,curGrid);

        if(tryDestTile === "#")
            return false;
        else if(tryDestTile === ".") {
            gu.setTile(tryDestLoc, curGrid, "O");
            gu.setTile(boxPos, curGrid, ".");
            return true;
        }
        //else then  tryDestTile === "O"
        /// lazy: first call moved the other box, second moves this one
        return tryMoveBox(tryDestLoc,direction) && tryMoveBox(boxPos,direction);
    }

    for(const move of directions) {
        const tryDestLoc = gu.addPoints(robotPos,move);

        if(gu.getTileFrom(tryDestLoc, curGrid) ===  "O") 
            tryMoveBox(tryDestLoc,move);

        if(gu.getTileFrom(tryDestLoc, curGrid) == ".")
            robotPos = tryDestLoc;
    }

    gu.setTile(robotPos, curGrid, "@");
    
    return curGrid;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim())//.filter(l=>l!='');

    let [rawGrid,rawDirections] = splitArray(cleanedLines,"");

    rawDirections = rawDirections.join("").split("");

    const grid = gu.parseGrid<Tile>(rawGrid);
    const directions = rawDirections.map(mapDirection);

    console.log({rawDirections});

    const result = runSim(grid,directions);

    console.log(gu.renderGrid(result));

    const answer = gu.findAll(result,"O").reduce((acc,[x,y])=>acc + (y*100) + x,0)

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
