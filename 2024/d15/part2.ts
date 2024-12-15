import { runMain, splitArray, sum, } from "../util.ts";
import { count, map } from "../iter_util.ts";
import { memoize, pipe, } from '../func_util.ts';
import * as gu from "../grid_util.ts";
import * as p1 from './part1.ts';
import { mapDirection } from './part1.ts';

type Tile = "#"|"["|"]"|"."|"@";

function runSim(grid:gu.Grid<Tile>, directions:gu.Point[]):gu.Grid<Tile> {

    let robotPos = gu.findAll(grid, "@")[0];
    const curGrid = grid.map(c=>[...c]) as gu.Grid<Exclude<Tile,"@">>;
    gu.setTile(robotPos, curGrid, ".");

    function tryMoveBoxHoriz(boxPos:gu.Point, direction:gu.Point):boolean {
        const tryDestLoc = gu.addPoints(boxPos,gu.addPoints(direction,direction));
        const tryDestTile = gu.getTileFrom(tryDestLoc,curGrid);

        if(tryDestTile === "#")
            return false;
        else if(tryDestTile === ".") {
            
            const [near,far] = (direction[0] === 1) ? ["[","]"] : ["]","["];

            gu.setTile(tryDestLoc, curGrid, far);
            gu.setTile(gu.addPoints(boxPos,direction), curGrid, near);

            gu.setTile(boxPos, curGrid, ".");

            return true;
        }
        //else then tryDestTile === "[" or "]"
        /// lazy: first call moved the other box, second moves this one
        return tryMoveBoxHoriz(tryDestLoc,direction) && tryMoveBoxHoriz(boxPos,direction);
    }

    function tryMoveBoxVert(boxPos:gu.Point, direction:gu.Point, checkOnly=false):boolean {
        const [boxPosL, boxPosR] = gu.getTileFrom(boxPos,curGrid) === "]" ?
            [gu.addPoints(boxPos,[-1,0]),boxPos] :
            [boxPos,gu.addPoints(boxPos,[1,0])];

        const tryDestLocL = gu.addPoints(boxPosL,direction);
        const tryDestLocR = gu.addPoints(boxPosR,direction);

        const tryDestTileL = gu.getTileFrom(tryDestLocL,curGrid);
        const tryDestTileR = gu.getTileFrom(tryDestLocR,curGrid);

        if(tryDestTileL === "#" || tryDestTileR === "#")
            return false;
        else if(tryDestTileL === "." && tryDestTileR === ".") {
            if(!checkOnly) {
                gu.setTile(tryDestLocL, curGrid, "[");
                gu.setTile(tryDestLocR, curGrid, "]");

                gu.setTile(boxPosL, curGrid, ".");
                gu.setTile(boxPosR, curGrid, ".");
            }
            return true;
        }

        ////// brain, please function, this should not be that difficult
        const nextBoxes =
            tryDestTileL === "[" ?
            [tryDestLocL] :
            [
                tryDestTileL === "]" ? [tryDestLocL] : [],
                tryDestTileR === "[" ? [tryDestLocR] : [],
            ].flat();
        //const nextBoxes = [ // will, at times, check the same box twice... meaning it may also MOVE the same box twice!
        //    tryDestTileL === "[" || tryDestTileL === "]" ? [tryDestLocL] : [],
        //    tryDestTileR === "[" || tryDestTileR === "]" ? [tryDestLocR] : [],
        //].flat();
        //
        const canMove = nextBoxes.every(n=>tryMoveBoxVert(n,direction,true));

        if(!canMove) return false;
        if(checkOnly) return canMove;

        return nextBoxes.every(n=>tryMoveBoxVert(n,direction)) && tryMoveBoxVert(boxPos,direction);
    }

    function renderState(header:string) {
        return;
        console.log(header);
        console.log(gu.renderGrid(
            curGrid.map((r,y)=>r.map((t,x)=> (x === robotPos[0] && y === robotPos[1]) ? "@" : t))
        ));
    }

    renderState("init");
    for(const move of directions) {
        const tryDestLoc = gu.addPoints(robotPos,move);

        if((["[","]"] as const).some(t=>gu.getTileFrom(tryDestLoc, curGrid) ===  t)) {
        renderState("pre-move "+move);
            (move[0] === 0 ? tryMoveBoxVert : tryMoveBoxHoriz)(tryDestLoc,move);
        renderState("post-move "+move);
        }

        if(gu.getTileFrom(tryDestLoc, curGrid) == ".")
            robotPos = tryDestLoc;

        //renderState("move "+move);
    }

    gu.setTile(robotPos, curGrid, "@");
    
    return curGrid;
}

function expand(src:gu.Grid<p1.Tile>):gu.Grid<Tile> {
    const map = {
        "#":["#","#"],
        "O":["[","]"],
        ".":[".","."],
        "@":["@","."],
    } as const;
    return src.map(_=>_.map(t=>map[t]).flat());
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim())//.filter(l=>l!='');

    const [rawGrid,rawDirections] = splitArray(cleanedLines,"");

    const grid = expand(gu.parseGrid<p1.Tile>(rawGrid));
    const directions = rawDirections.join("").split("").map(mapDirection);

    //console.log({rawGrid,rawDirections,grid,directions});
    //console.log({grid});

    const result = runSim(grid,directions);

    console.log(gu.renderGrid(result));

    const answer = gu.findAll(result,"[").reduce((acc,[x,y])=>acc + (y*100) + x,0)

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
