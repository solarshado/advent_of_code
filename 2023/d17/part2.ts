import { runMain, sum, } from "../util.ts";
import { map, range, toArray } from "../iter_util.ts";
import { Point, addPoints, gridHeight, gridWidth, isPointOnGrid, parseGrid, pointsEqual, renderGrid } from "../grid_util.ts";
import { DIRECTIONS, Direction, Edge, EdgeGenerator, Node, Tile, areValidSubsequentDirections, directionMap, doTraversal, getTileValue, nodeFactory, renderPoints } from './part1.ts';

const edgeLengths = [4,5,6,7,8,9,10] as const;

const eg:EdgeGenerator = (grid,_Edge,_Edge_for) =>
    function edgeGen(loc: Point): Edge<Node, Node>[] {
        return (DIRECTIONS).flatMap(
            (direction):Edge[]=>{
                const dirDelta=directionMap[direction];
                const es = edgeLengths.map(distance=>({
                    distance,
                    p: addPoints(dirDelta.map(dim=>dim*distance) as Point, loc),
                })).filter(({p})=>isPointOnGrid(p,grid));

                if(es.length == 0)
                    return [];

                const minDist = Math.min(...es.map(e=>e.distance));
                const stub = minDist > 1 ? [
                    ...map(range(1,minDist-1),
                           (distance)=>addPoints(dirDelta.map(dim=>dim*distance) as Point, loc))
                ] : [];
                const stubTraversalCost = sum(stub,p=>getTileValue(grid,p));

                const ret:InstanceType<typeof _Edge>[] = [];
                let tail = es.pop();
                while(true) {
                    if(tail === undefined)
                        break;
                    const {distance,p:end} = tail;

                    const old = _Edge_for(loc,end, false);
                    if(old !== undefined)
                        ret.push(old)
                    else {
                        const traversalCost = stubTraversalCost + sum(es,({p})=>getTileValue(grid,p));
                        ret.push(new _Edge(
                            loc,
                            end,
                            direction,
                            distance,
                            traversalCost,
                        ));
                    }
                    tail = es.pop();
                }
                return ret;
            });
    }

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const grid = parseGrid<Tile>(cleanedLines);

    console.log(renderGrid(grid));

    const dest:Point = [gridWidth(grid)-1,gridHeight(grid)-1]

    const destinationNode = doTraversal(grid, [0,0], dest, g=> nodeFactory(g,eg));

    // /*
    const bestPath = toArray((function* (start:Node) {
        let lastDir:Direction|"" = "";
        let cur = start;
        const d2t:{[key in Direction]:string} = {
            D: "V",
            L: "<",
            R: ">",
            U: "^",
        } as const;
        while( cur !== undefined ) {
            const p = cur.location;
            if(pointsEqual(p,[0,0]))
                break;

            type Route = NonNullable<typeof cur.cheapestRouteToStartVia[Direction]>;
            const routes = DIRECTIONS.reduce((acc,dir)=> {
                const route = cur.cheapestRouteToStartVia[dir]
                if((lastDir === "" || areValidSubsequentDirections(dir,lastDir)) &&
                   route !== undefined)
                        acc.push([dir,route]);
                return acc;
            }, [] as [Direction,Route][]);

                const sortedRoutes = routes.toSorted(([_,l],[__,r])=>l.costToHere - r.costToHere)
            const [[dir,route]] =sortedRoutes;

            lastDir = dir;
            cur = route.toStart.end;

            const t = d2t[dir];

            const ret = [p,t] as [Point,string];
            //console.log("backtracking...",ret);
            yield ret;
        }

    })(destinationNode))

    console.log(
        "found path!\n"+renderPoints(grid, bestPath),
            //pathAsArray.toReversed().map(s=>`${s.lastMove} (${s.stepsSinceTurn}) -> ${s.loc} -- ${s.totalHeatLoss}`).join('\n')
    );
   // */

    const answer = Object.values(destinationNode.cheapestRouteToStartVia)
                        .reduce((acc,cur)=> Math.min(acc, cur?.costToHere ?? Infinity),Infinity);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
