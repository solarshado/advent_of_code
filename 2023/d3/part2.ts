import { linesFrom, sum } from "../util.ts";
import * as p1 from './part1.ts';

async function main() {
    const schematic = await linesFrom();
    //const schematic = p1.example;

    const grid = new p1.Grid(schematic);

    console.log(grid);

    /*
    [
        [0,0,467],
        [1,0,467],
        [2,0,467],
        [2,2,35],
        [8,7,755],
    ].forEach(([x,y,exp])=>dump(x,y,exp));
    return;

    function dump(x:number,y:number,expected?:number){
        const at = grid.get(x,y);
        const ns = grid.getFullNumberAt(x,y);
        console.log(x,y,at);
        console.log(ns);
        if(expected != undefined) console.log(`expected: ${expected} -- ${expected == ns?.value?"SUCCESS":"FAIL"}`);
    }
    // */

    const gears:[number,number][] = [];
    // todo? memoize getFullNumberAt

    for(let y = 0; y < grid.height; ++y)
        for(let x = 0; x < grid.width; ++x) {
            let curr = grid.get(x,y);
            console.log(`on: ${x},${y}: ${curr}`);
            if(curr != "*")
                continue;

            //console.log('found gear');

            const {maxX,maxY,minX,minY} = grid.getNeighborhoodCoords(x,y);

            const numberSet = new Map<string,number>();

            for(let xx = minX; xx < maxX+1 ; ++xx)
                for(let yy = minY; yy < maxY+1 ; ++yy) {
                    const num = grid.getFullNumberAt(xx,yy)
                    if(num == null)
                        continue;
                    const key = num.startX+","+num.y;
                    numberSet.set(key,num.value);
                }

            const numbers = [...numberSet.values()];

            if(numbers.length != 2)
                continue;

            gears.push([numbers[0],numbers[1]]);
        }

    console.log(gears);

    const ratios = gears.map(([l,r])=>l*r)

    console.log(sum(ratios));
}

if(import.meta.main)
    await main();
