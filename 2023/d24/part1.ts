import { runMain, sum, } from "../util.ts";
import { count, filter, genPairs, map, toArray } from "../iter_util.ts";
import { Point3D, Tripple } from "../d22/part1.ts";
import * as d22 from "../d22/part1.ts";
import { PointManager, Point } from "../d23/part1.ts";

export type Hailstone = {
    readonly position:Point3D,
    readonly velocity:Point3D,
}

export function parseInput(lines:string[]):Hailstone[] {
    return lines.map(l=>{
        const [posRaw, velRaw] = l.split("@");

        const position = Point3D.for(posRaw.split(",").map(v=>Number(v.trim())) as Tripple)
        const velocity = Point3D.for(velRaw.split(",").map(v=>Number(v.trim())) as Tripple)

        return {position, velocity};
    });
}

function toEqn2D({position,velocity}:Hailstone) {
    const {x,y} = position;
    const {x:dx,y:dy} = velocity;

    const slope = dy/dx;

    const xZeroAt = y - (slope * x);

    return {slope, xZeroAt,
        forX(x:number) { return this.xZeroAt + (x * this.slope); },
        forY(y:number) { return (y - this.xZeroAt) / this.slope; }
    };
}

function isInFuture(target:number, position:number, delta:number):boolean {
    const deltaSign = Math.sign(delta);
    return deltaSign == 1 ?
        position < target :
        deltaSign == -1 ?
        position > target :
        position == target;
}

export function doCollideInRange(pair:[Hailstone, Hailstone], rangeMin:number, rangeMax:number):boolean {
    const [eq1, eq2] = pair.map(toEqn2D);

    if(eq1.slope == eq2.slope)
        return false;

    const interceptX = 
        (eq1.xZeroAt - eq2.xZeroAt)/
        (eq2.slope - eq1.slope);

    if(pair.some(({position:{x},velocity:{x:dx}})=>!isInFuture(interceptX,x,dx)))
        return false;
    
    const interceptY = eq1.forX(interceptX);

    if(pair.some(({position:{y},velocity:{y:dy}})=>!isInFuture(interceptY,y,dy)))
        return false;

    //console.log("pair",pair,"icept",[interceptX,interceptY]);

    return interceptX >= rangeMin && interceptX < rangeMax &&
            interceptY >= rangeMin && interceptY < rangeMax 
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const stones = parseInput(cleanedLines);

    //console.log(stones);

    const pairs = genPairs(stones);

    //const minRange = 7, maxRange = 27;
    const minRange = 200_000_000_000_000, maxRange = 400_000_000_000_000;

    const results = toArray(pairs).map(p=>({p, 'col?':doCollideInRange(p,minRange,maxRange)}));

    //console.log(results); 

    const answer = count(filter(results, ({["col?"]:v})=>v===true));

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
