import { lcm, lcmAll, runMain, sum, } from "../util.ts";
import { count, map, reduce } from "../iter_util.ts";
import { ModuleNetwork, Pulse, PushButtonResult, buttonPulse, parseInput, } from './part1.ts';
import * as pt1 from './part1.ts';
import { memoCacheSym, memoize } from "../func_util.ts";
//
// nicked from d18p1; fix return type
export function* pairWise<T>(src:T[]): Generator<[T,T], void, unknown>{
    const len = src.length;
    for(let i = 0 ; i < len - 1; ++i){
        const a = src[i], b = src[i+1];
        yield [a,b]
    }
}

function traceback(network:ModuleNetwork) {
    const goal:Pulse = {
        src: "dt",
        dest: "rx",
        type: "L"
    };

    const toCheck = ["dt"]

    const found:Pulse[] = [];

//    while(toCheck.length > 0) {
        const curName = toCheck.shift()!;
        const cur = network.get(curName)!;

        //if(!(cur instanceof pt1.ConjunctionModule)) {
            found.push({src:curName, dest:"*", type: "H"})
        //}

        const conj = cur as pt1.ConjunctionModule;

        const inputs = Object.keys(conj.extractState())

        toCheck.push(...inputs);
 //   }

    return toCheck.map(src=>({src, dest:"*", type: "H" as pt1.PulseType}))

    return found;
}

function matches(p:Pulse, pat:Partial<Pulse>) {
    for(const [k,v] of Object.entries(pat)) {
        const val = p[k as keyof Pulse];

        if(val !== v && v !== "*")
            return false;
    }
    return true;
}

export function pushButton(network:ModuleNetwork, toWatchFor:Partial<Pulse>[] ) {
    //const totalPulses = { H:0, L:0 };

//    if(setInitState)
//        applyStates(network,setInitState)

    const pulseQueue:Pulse[] = [];

    pulseQueue.push(buttonPulse);

    const searchResults = toWatchFor.map(pattern=>({pattern, seen: false}));

    //console.log("button pushed!")
    
    while(pulseQueue.length > 0) {
        const curPulse = pulseQueue.shift()!;

        //const {src,type,dest} = curPulse;
        //console.log("pulse:",src,"-",type,">",dest);

        for(const pat of searchResults) {
            if(pat.seen) continue;
            if(matches(curPulse, pat.pattern))
               pat.seen = true;
        }

        //totalPulses[curPulse.type] += 1;

        const mod = network.get(curPulse.dest);

        if(mod === undefined)
            continue;

        const result = mod.process(curPulse);

        if(result === null)
            continue;

        for(const dest of mod.outputs)
            pulseQueue.push({
                src: mod.name,
                type: result,
                dest,
            });
    }

//    const finalState = extractStates(network);

    //console.log("network quiet after",totalPulses,"pulses")

    return { searchResults }

   // return { totalPulses, /*finalState,*/ }
}

function bruteForceSearch(network:ModuleNetwork, targets:Partial<Pulse>[], iterations=10_000 ) {

    let pushes = 0;

    /*
    network.set("rx",{
        name: "rx",
        outputs: [],
        process({type}:Pulse) {
            if(type === "L")
                finished = true;
            return null;
        }
    });
    */

    const findings = targets.map(pattern=>({pattern, seenAt: [] as number[]}));

    do {
        const {searchResults} = pushButton(network, targets);
        ++pushes;

        for(const {pattern,seen} of searchResults) {
            if(!seen) continue;

            const record = findings.find(p=>p.pattern==pattern);
            if(!record) continue;

            record.seenAt.push(pushes);
        }

        if(pushes % 100 == 0) {
            console.log("pushes:",pushes)
        }

    } while(pushes < iterations);

    return findings;
}

function confirmPattern(nums:number[]) {
    const [first,second,...rest] = nums;

    const interval = second - first;

    const holds = rest.reduce((acc,cur)=>{
        const {heldSoFar,last} = acc;
        if(!heldSoFar) return acc;

        const delta = cur - last;
        acc.heldSoFar = delta == interval;
        acc.last = cur;

        return acc;
    }, {last: second, heldSoFar: true, prelude:first, interval});

    return holds;
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const modules = parseInput(cleanedLines);

//    console.log(modules);
//    return;

    const targets = traceback(modules);

    //console.log(traceback);

    const results = bruteForceSearch(modules,targets,50_000);

    //console.log(results);

    const r2 = results.map(r=>({...r, holds: confirmPattern(r.seenAt), seenAt: undefined,
             //                  deltas: reduce(pairWise(r.seenAt), (acc,[l,r])=> (acc.push(r-l),acc), [] as number[]),
    }))
    console.log(r2);

    //const answer = bruteForceButMemoized(modules);
    const answer = lcmAll(r2.map(r=>r.holds.interval));

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
