import { runMain, sum, yeet, } from "../util.ts";
import { count, every, map, range, some, toArray } from "../iter_util.ts";
import { pipe } from "../func_util.ts";

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

export class Brick {
    public name="";
    public readonly body: readonly Point3D[];
    private readonly allPoints:Set<Point3D>;
    constructor(
        public readonly head:Point3D,
        public readonly tail:Point3D,
    ) {
        if(head === tail) {
            this.body = [];
            this.allPoints = new Set([head]);
            return;
        }
        for(const axis of ["x","y","z"] as const) {
            const h = head[axis], t = tail[axis];
            if(h !== t){

                this.allPoints = new Set()
                this.allPoints.add(head);

                const [low, high] = h > t ? [t,h] : [h,t];
                this.body = toArray(map(range(low+1, high-(low+1)), n=>{
                    const {x,y,z} = head;
                    const proto = {x,y,z}
                    proto[axis] = n;
                    const p = Point3D.for(proto.x,proto.y,proto.z);
                    this.allPoints.add(p);
                    return p
                }));
                
                this.allPoints.add(tail);

                return;
            }
        }
        throw "invalid brick: "+head+"~"+tail;
    }

    isTouchingGround():boolean {
        return this.head.z === 1 || this.tail.z === 1;
    }

    getLowestPoint():Point3D {
        return this.head.z < this.tail.z ?
            this.head : this.tail;
    }

    getHighestPoint():Point3D {
        return this.head.z > this.tail.z ?
            this.head : this.tail;
    }

    contains(p:Point3D):boolean {
        return this.allPoints.has(p);
    }

    isSupporting(other:Brick):boolean {
        return some(this.allPoints, p=> other.contains( p.add([0,0,1]) ) );
    }

    intersectsWith(other:Brick):boolean {
        for(const point of other.allPoints)
            if(this.allPoints.has(point))
                return true;
        return false;
    }
}

export function parseInput(lines:string[]):Brick[] {
    const alphabet = (function* (){
        for(const cur of "ABCDEFGHIJKLMNOP".split(""))
            yield cur;
    })()
    return lines.map(l=>{
        const [head,tail] = l.split('~').map(p=>Point3D.for(p.split(",").map(Number) as Tripple));
        const b = new Brick(head,tail);
        b.name = alphabet.next().value!;
        return b;
    });
}

/** @returns sparse array, only indexes with blocks at them are populated */
export function groupByLowestPoint(bricks:Brick[]):Brick[][] {
    return bricks.reduce((acc,cur)=>{
        const z = cur.getLowestPoint().z;

        if(acc[z] === undefined)
            acc[z] = [];

        acc[z].push(cur);
        
        return acc;
    }, [] as Brick[][]);
}

export function dropBricks(bricks:Brick[]):Brick[] {

    const grouped = bricks.reduce((acc,cur)=>(acc[cur.isTouchingGround() ? "s" : "f"].push(cur),acc),
                                  {s:[] as Brick[], f:[] as Brick[]})

    const settledBricks = grouped.s;

    /*
    let fallingBricks = grouped.f.sort((l,r)=>
                                       Math.min(l.head.y, l.tail.y) -
                                       Math.min(r.head.y, r.tail.y));
    */

    const fallingBricks = groupByLowestPoint(grouped.f);

    //console.log("dropBricks - settled:",settledBricks);
    //console.log("dropBricks - falling:",fallingBricks);

    const fallDelta = Point3D.for(0,0,-1);

    while(fallingBricks.length > 0) {
        const thisZ = fallingBricks.shift();
        if(thisZ === undefined)
            continue;

        while(thisZ.length > 0) {
            const cur = thisZ.shift()!;

            if(cur.isTouchingGround() || settledBricks.some(b=>b.isSupporting(cur))) {
                settledBricks.unshift(cur);
                continue;
            }

            const {head,tail} = cur;
            const [newH, newT] = [head, tail].map(p=>p.add(fallDelta));
            const newBrick = new Brick(newH, newT);
            newBrick.name = cur.name;
            thisZ.push(newBrick);
        }

        if(thisZ.length > 0)
            fallingBricks.unshift(thisZ);
    }

    return settledBricks;
}

export function countSafeToDisentigrateBricks(bricks:Brick[]):number {
    const grouped = groupByLowestPoint(bricks)//.filter(z=> z!==null && z!==undefined);

    const supportedByMap = new Map<Brick,Set<Brick>>();
    const supportsMap = new Map<Brick,Set<Brick>>()

    debugger;

    for(const bricks of grouped) {
        if(!bricks) continue;
        for(const cur of bricks) {
            const top = cur.getHighestPoint().z
            const toCheck = grouped.filter((g,i)=> i>top && g!==null && g!==undefined).flat();

            for(const above of toCheck) {
                if(!cur.isSupporting(above))
                    continue;

                if(!supportedByMap.has(above))
                    supportedByMap.set(above,new Set([cur]));
                else
                    supportedByMap.get(above)!.add(cur);

                if(!supportsMap.has(cur))
                    supportsMap.set(cur,new Set([above]));
                else
                    supportsMap.get(cur)!.add(above);
            }
        }
    }

    const yeetable = bricks.filter(b=>{
        const supports = supportsMap.get(b);
        if(supports === undefined)
            return true;

        if(every(supports, child=>supportedByMap.get(child)!.size > 1))
            return true;
        
        return false;
    });

    return yeetable.length;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const bricks = parseInput(cleanedLines)

    console.log(bricks);

    const settled = dropBricks(bricks);

    console.log(settled);

    const safeToDis = countSafeToDisentigrateBricks(settled);

    const answer = safeToDis;

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
