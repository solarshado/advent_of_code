import { linesFrom, sum } from "../util.ts";

const example = `
seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4
`.trim();

type MapOverride = {srcStart:number, destStart:number, length:number};

function parseOverride(str:string):MapOverride {
    console.log("parseOverride",str);
    const [destStart, srcStart, length] =
        str.split(/\s+/).map(s=>+s);
    return {srcStart, destStart, length};
}

function mapStep(srcVal:number, overrides:MapOverride[]):number {
    for(const {srcStart, destStart, length} of overrides) {
        const delta = srcVal - srcStart;
        if(delta >= 0 && delta <= length) {
            return destStart + delta;
        }
    }
    // not overridden:
    return srcVal;
}

function mapMultiStep(startVal:number, overrideLayers:MapOverride[][]) {
    //return overrideLayers.reduce((acc,cur)=>mapStep(acc,cur), startVal);
    return overrideLayers.reduce(mapStep, startVal);
}

function parseAlmanac(lines:string[]):{seeds:number[], maps:MapOverride[][]} {
    const seeds = lines[0].split(':')[1].trim().split(/\s+/).map(s=>+s);

    const maps = lines.slice(1).reduce(function(acc,cur) {
        if(cur == '')
            return acc;

        if(cur.endsWith('map:')) {
            acc.push([]);
            return acc;
        }
        // must be a map line
        const override = parseOverride(cur);
        acc.at(-1)!.push(override);

        return acc;
    },[] as MapOverride[][]);

    return {seeds, maps};
}

async function main() {
    const lines = (await linesFrom()).filter(l=>l!='');
    //const lines = example.split('\n');

    const {maps, seeds} = parseAlmanac(lines);

    console.log(maps);
    console.log(seeds);

    const results = seeds.map(seed=>({seed,location:mapMultiStep(seed,maps)}));

    console.log(results)
    console.log(Math.min(...results.map(r=>r.location)));
}

if(import.meta.main)
    await main();
