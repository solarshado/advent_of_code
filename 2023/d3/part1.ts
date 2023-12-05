import { linesFrom, sum } from "../util.ts";

const example = `
467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..
`.trim();

function isDigit(s:string):boolean {
    return !isNaN(parseInt(s));
}

function isSymbol(s:string):boolean {
    return s != '.' && !isDigit(s);
}

type GridNumber = {
  value: number;
  y: number;
  startX: number;
  endX: number;
};

class Grid {
    private readonly data:string[];
    public readonly width:number;
    public readonly height:number;

    constructor(source:string|string[]) {
        const data = Array.isArray(source) ? [...source] : source.split('\n');
        this.data = data;
        this.height = data.length;
        this.width = data[0].length
    }

    get(x:number, y:number):string {
        return this.data[y][x];
    }

    getNeighborhoodCoords(x:number, y:number) {
        const minX = Math.max(x-1,0);
        const maxX = Math.min(x+1,this.width-1);
        const minY = Math.max(y-1,0);
        const maxY = Math.min(y+1,this.height-1);

        return {minX, maxX, minY, maxY};
    }

    getNeighborhood(x:number, y:number):string[] {
        const {minX, maxX, minY, maxY} =
            this.getNeighborhoodCoords(x,y);

        //console.log(`getNeighborhood(${x},${y}):`,{minX,maxX,minY,maxY});

        const ret = [];

        for(let y = minY; y < maxY+1; ++y) {
            ret.push(this.data[y].substring(minX,maxX+1));
        }

        return ret;
    }

    getFullNumberAt(x:number, y:number):GridNumber|null {
        const row = this.data[y];
        const startPoint = row[x];
        if(!isDigit(startPoint))
            return null;

        let strNum = startPoint;
        let startX = x;
        let endX = x;

        for(let _x = x+1; _x < this.width; ++_x) {
            const c = row[_x];
            if(!isDigit(c))
                break;
            strNum = strNum + c;
            endX = _x;
        }

        for(let _x = x-1; _x >= 0; --_x) {
            const c = row[_x];
            if(!isDigit(c))
                break;
            strNum = c + strNum;
            startX = _x;
        }

        return {value: +strNum, y, startX, endX};
    }
}

async function main() {
    const schematic = await linesFrom();
    //const schematic = example;

    const grid = new Grid(schematic);

    console.log(grid);

    /*
    let v = "";
    do {
        v = prompt("num at? (yeet to bail)") ?? "";
        const [x=0,y=0] = v.split(',').map(n=>+n);
        const at = grid.get(x,y);
        const ns = grid.getFullNumberAt(x,y);
        console.log(x,y,at);
        console.log(ns);
    } while(v!='yeet');
    */

    const goodNums = [];

    // not optimally inefficient but whatever
    for(let y = 0; y < grid.height; ++y)
        for(let x = 0; x < grid.width; ++x) {
            let curr = grid.get(x,y);
            console.log(`on: ${x},${y}: ${curr}`);
            if(!isDigit(curr))
                continue;

            //console.log('found digit');

            let foundSymbol = false
            let acc = "";

            do {
                acc += curr;

                console.log(`inner loop: ${x},${y}; foundSym? ${foundSymbol} ; acc = '${acc}'`);

                const neighbors = grid.getNeighborhood(x,y);
                console.log(`neighbors: ${neighbors}`);
                if(neighbors.some(s=>[...s].some(isSymbol)))
                    foundSymbol = true;

                ++x;
                if(x > grid.width)
                    break;
                curr = grid.get(x,y);
            } while(isDigit(curr));

            console.log(`left inner loop: ${x},${y}; foundSym? ${foundSymbol} ; acc = '${acc}'`);

            if(foundSymbol)
                goodNums.push(+acc);

            console.log(`end of outer loop; goodNums: [${goodNums}]'`);
        }

    console.log(goodNums);

    console.log(sum(goodNums));
}

if(import.meta.main)
    await main();

export { type GridNumber, example, isDigit, isSymbol, Grid };
