import { runMain, sum, } from "../util.ts";
import { parseGrid, Point, Grid as AbstractGrid, renderGrid, pointToKey, getTileFrom, addPoints, isPointOnGrid, pointsEqual, gridWidth, gridHeight, setTile } from "../grid_util.ts"
import { Mapper, Predicate, pipe } from "../func_util.ts";
import { filter, map, reduce, toArray } from "../iter_util.ts";

export type Tile = number;
export type Grid = AbstractGrid<Tile>;

export function getTileValue(grid:Grid, loc:Point):number {
    return +getTileFrom(loc,grid);
}

export const DIRECTIONS = ["U","D","L","R"] as const;
export type Direction = typeof DIRECTIONS[number];

export const directionMap:{ [key in Direction]: Point } = {
    U: [0,-1],
    D: [0,+1],
    L: [-1,0],
    R: [+1,0],
}

export function areOppositeDirections(l:Direction, r:Direction):boolean {
    return (
        (l === "U" && r === "D") ||
        (l === "D" && r === "U") ||
        (l === "L" && r === "R") ||
        (l === "R" && r === "L")
    );
}

export function areValidSubsequentDirections(l: Direction, r: Direction) {
  return l !== r && !areOppositeDirections(l, r);
}

export class PriorityQueue<T> {
    inner:[number,T][] = [];
    //#inner:[number,T][] = [];
    #inner = this.inner;
    constructor(
        private readonly mapper:Mapper<T,number>,
        items?:Iterable<T>
    ) {
        if(items)
            for(const item of items) 
                this.add(item);
    }

    add(item:T):void;
    add(item:T, priority:number):void;
    add(item:T, overrideMapper:Mapper<T,number>):void;

    add(item:T, mapperOrPrio?:Mapper<T,number>|number) {
        const mapper =
            typeof mapperOrPrio === "function" ?
            mapperOrPrio :
            this.mapper;
        const prio =
            typeof mapperOrPrio === "number" ?
            mapperOrPrio :
            mapper(item);

        const insertLoc = this.#inner.findLastIndex(([p,_])=>p<=prio)+1;

        this.#inner.splice(insertLoc,0,[prio, item]);
    }

    filter(pred:Predicate<T>):PriorityQueue<T> {
        const ret = new PriorityQueue(this.mapper);

        this.#inner.forEach(([i,e])=> {
          if(pred(e))
              ret.add(e, ()=>i);
        });

        return ret;
    }

    filterInPlace(pred:Predicate<T>):void {
        this.#inner = this.#inner.filter(([_,e])=>pred(e));
    }

    popFirst():T|undefined {
        return this.#inner.shift()?.[1];
    }

    some(pred:Predicate<T>):boolean {
        return this.#inner.some(([_,e])=>pred(e));
    }

    get length() { return this.#inner.length; }

    [Symbol.for("Deno.customInspect")]() {
        return Deno.inspect(this.#inner);
    }
}

export function withPointsReplaced<T>(grid:AbstractGrid<T>, points:Iterable<Point>, tile:string) {
  const copy = (grid as AbstractGrid<T|string>).map(l => [...l]);
  for (const p of points) {
    setTile(p, copy, tile);
  }
  return copy;
}

export type Node = {
    location:Point,
    //edges:{ [key in Direction]:Edge[] },
    edges:Edge<Node>[],
    localCost:number,
    cheapestRouteToStartVia:{[key in Direction]: {toStart:Edge, costToHere:number}|undefined},
};

const edgeLengths = [1,2,3] as const;
type EdgeLength = typeof edgeLengths[number];

type EdgeEnd = Node|Point;

export type Edge<TStart extends EdgeEnd = Node, TEnd extends EdgeEnd = Node> = {
    start:TStart,
    end:TEnd,
    direction:Direction,
    distance:EdgeLength|number,
    traversalCost:number,
};

type NodeFactory = {
    getNode(loc:Point):Node;
    getEdge(start:Point, end:Point):Edge<Node,Node>;
    getMirrorOfEdge(other:Edge):Edge<Node,Node>;
    _dumpNodes():Iterator<Node>;
    _dumpEdges():Iterator<Edge<Node,Node>>;
};

export type EdgeGenerator = (
    grid:Grid,
    edgeCtor:EdgeClass,
    edgeGetter:(start:Point, end:Point, createIfNeeded:boolean)=>Edge
    )=> (loc:Point)=>Edge[];

export type EdgeClass = {
    new(
        _startPoint:Point,
        _endPoint:Point,
        direction:Direction,
        distance:number,
        traversalCost:number,
    ):Edge
}

export function nodeFactory(grid:Grid, edgeGenOverride?:EdgeGenerator):NodeFactory {
    const locKeyFunc = pointToKey;

    const nodeKeyFunc = (loc:Point)=>locKeyFunc(loc);
    const nodeMap = new Map<string,Node>();

    const edgeKeyFunc = (startLoc:Point,endLoc:Point)=>locKeyFunc(startLoc)+">"+locKeyFunc(endLoc)
    const edgeMap = new Map<string,_Edge>();

    class _Edge implements Readonly<Edge<Node,Node>> {
        constructor(
            public readonly _startPoint:Point,
            public readonly _endPoint:Point,
            public readonly direction:Direction,
            public readonly distance:EdgeLength|number,
            public readonly traversalCost:number,
        ) {
            const key = edgeKeyFunc(this._startPoint, this._endPoint);
            if(edgeMap.has(key))
                throw "duplicate edge created! not supposed to happen!"
            edgeMap.set(key,this);
        }

        get start() { return getNode(this._startPoint); }
        get end() { return getNode(this._endPoint); }

        static for(start:Point, end:Point):_Edge;
        static for(start:Point, end:Point, createIfNeeded:boolean):_Edge|undefined;

        static for(start:Point, end:Point, createIfNeeded=true):_Edge|undefined {
            const key = edgeKeyFunc(start, end);

            if(edgeMap.has(key))
                return edgeMap.get(key)!;

            if(!createIfNeeded)
                return undefined;

            // could check for an existing mirrored edge, but 
            // is it worth it?

            // grossly indirect, but getNode calls buildNode,
            // which inits connected edges, who add themselves
            // to edgeMap
            void getNode(start);
            return edgeMap.get(key)!;
        }

        static mirror(other:_Edge):_Edge {
            const {_startPoint: sl, _endPoint: el} = other;
            return _Edge.for(el,sl)!;
        }
    }

    const edgesFor = edgeGenOverride !== undefined ?
                        edgeGenOverride(grid,_Edge, _Edge.for) :
                        _edgesFor;

    function buildNode(location:Point):Node {
        return {
          location,
          edges: edgesFor(location),
          localCost: getTileValue(grid,location),
          cheapestRouteToStartVia: {
              U: undefined,
              D: undefined,
              L: undefined,
              R: undefined,
          }
        };
    }

    function _edgesFor(loc:Point):Edge[] {
        return (DIRECTIONS).flatMap(
            (direction):Edge[]=>{
                const es = edgeLengths.map(distance=>({
                    distance,
                    p: addPoints(directionMap[direction].map(dim=>dim*distance) as Point, loc),
                })).filter(({p})=>isPointOnGrid(p,grid));

                    const ret:_Edge[] = [];
                    let tail = es.pop();
                    while(true) {
                        if(tail === undefined)
                            break;
                        const {distance,p:end} = tail;

                        const old = _Edge.for(loc,end, false);
                        if(old !== undefined)
                            ret.push(old)
                        else {
                            const traversalCost = sum(es,({p})=>getTileValue(grid,p));
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

    function getNode(loc:Point):Node {
        const key = nodeKeyFunc(loc);

        if(!nodeMap.has(key))
            nodeMap.set(key,buildNode(loc));

        return nodeMap.get(key)!;
    }

    return {
        getNode,
        getEdge: _Edge.for,
        getMirrorOfEdge: _Edge.mirror,
        _dumpNodes: ()=> nodeMap.values(),
        _dumpEdges: ()=> edgeMap.values(),
    };
}

export function doTraversal(grid:Grid, startLoc:Point, goalLoc:Point, nodeFactoryOverride?:(grid:Grid)=>NodeFactory):Node {

    const nodeManager = (nodeFactoryOverride ?? nodeFactory)(grid);

    const { getNode, getEdge } = nodeManager;

    const totalNodeCount = gridWidth(grid) * gridHeight(grid);

    const seenEdges = new Set<Edge>();

    const filterNextEdges = ({direction:prevDir}:Edge, edges:Edge[]):Edge[] =>
        edges.filter(({direction:nextDir})=> areValidSubsequentDirections(nextDir, prevDir));

    type EnquedEdge = {edge:Edge, heatLossSoFar:number};

    const startEdges:EnquedEdge[] =
        getNode(startLoc).edges
        .map(e=>({heatLossSoFar: e.traversalCost, edge:e}))

    const toVisit = new PriorityQueue(e=> e.heatLossSoFar, startEdges);

    //console.log("doTraversal: primed with:",toVisit);

    //let bestPath:State|null = null;

    let steps = 1;
    do {
        const cur = toVisit.popFirst()!;
        const {
            edge: curEdge,
            edge:{end:curNode},
            heatLossSoFar,
        } = cur;

        steps++;

        if(seenEdges.has(curEdge))
            continue;

        seenEdges.add(curEdge);

        if(steps % 100 == 0) {
            const countIterator = (i:Iterator<unknown>)=>{let c = 0; while(i.next().value) ++c; return c;}
            console.log("step",steps," -- ",
                        "~"+countIterator(nodeManager._dumpNodes()),"/",totalNodeCount,"visited",
                        toVisit.length,"in queue");
            //console.log("entire queue",toVisit);
        }

        /*
        if(pointsEqual(cur.edge.end.location,goalLoc)) {
            console.log("reached goal at",cur.totalHeatLoss,"cost");
            //console.log("remaining queue",toVisit.inner.map(([p,e])=>[p, {...e,prev: e.prev?.loc}]));
            break;
        }
        */

        const next = visit(cur);

        /*
        const n = n0.filter(s=>{
            const alreadyInQueue = toVisit.some(o=>
                                                s.totalHeatLoss == o.totalHeatLoss &&
                                                //s.stepsSinceTurn == o.stepsSinceTurn &&
                                                pointsEqual(s.loc,o.loc) &&
                                                (!!s.prev && !!o.prev && pointsEqual(s.prev.loc,o.prev.loc))
                                               );
            /*
            if(alreadyInQueue)
                return false;
            * /
            return !alreadyInQueue;
        });
        */

       // const reachedGoal = n.find(({loc})=>pointsEqual(loc,goalLoc));

        for(const ee of next) {
            if(pointsEqual(goalLoc,ee.edge.end.location)) {
                // found you! visot be be sure the path's up to date, then bail
                visit(ee);
                break;
            }

            toVisit.add(ee);
        }
    } while(toVisit.length > 0);

    const goalNode = getNode(goalLoc)
    const bestPath = DIRECTIONS.some(dir=> goalNode.cheapestRouteToStartVia[dir] !== undefined);
    if(bestPath != undefined)
        return goalNode;

    throw "never reached goal!"

    function visit(cur:EnquedEdge):EnquedEdge[] {
        const {
            edge:curEdge,
            edge:{end:curNode},
            heatLossSoFar
        } = cur;

        const currentCost = heatLossSoFar + curNode.localCost;

        const mirrorEdge = nodeManager.getMirrorOfEdge(curEdge);
        const cheapRoute = curNode.cheapestRouteToStartVia[mirrorEdge.direction]
        if( cheapRoute === undefined ||
           currentCost < cheapRoute.costToHere) {
            curNode.cheapestRouteToStartVia[mirrorEdge.direction] = {
                toStart: nodeManager.getMirrorOfEdge(curEdge),
                costToHere: currentCost
            };
        }

        const validMoves = filterNextEdges(curEdge, curNode.edges);
        //const validMoves = filterNextEdges(curNode.cheapestRouteToStart.edge, curNode.edges);
        //console.log("visiting",loc,"next:",next)

        const usefulMoves = validMoves.map((e):EnquedEdge=>({edge: e, heatLossSoFar: currentCost + e.traversalCost}))
                                            /*
                                           .filter(ee=>{
                                               const farEnd = ee.edge.end;
                                               if(farEnd.cheapestRouteToStart === undefined)
                                                   return true;

                                               const costToVisit = ee.heatLossSoFar + farEnd.localCost;
                                               const previousBest = farEnd.cheapestRouteToStart.totalCost
                                               return costToVisit < previousBest;
                                           });
                                           */

        //console.log("visited",loc,"moving",lastMove, "adding:",n2.map(renderState));
        //console.log("visited",loc,"after moving",lastMove, ", adding:",n2.map(renderState));

        return usefulMoves;
    }
}

export function renderPoints<T>(grid:AbstractGrid<T>, points:Iterable<[Point,string]>) {
  const copy = (grid as AbstractGrid<T|string>).map(l => [...l]);
  for (const [p,t] of points) {
    setTile(p, copy, t);
  }
  return renderGrid(copy);
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const grid = parseGrid<Tile>(cleanedLines);

    console.log(renderGrid(grid));

    const dest:Point = [gridWidth(grid)-1,gridHeight(grid)-1]

    const destinationNode = doTraversal(grid, [0,0], dest);

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

    const answer = Object.values(destinationNode.cheapestRouteToStartVia)
                        .reduce((acc,cur)=> Math.min(acc, cur?.costToHere ?? Infinity),Infinity);

    console.log(answer);
}


if(import.meta.main)
    await runMain(main);
