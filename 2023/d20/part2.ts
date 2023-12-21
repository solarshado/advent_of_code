import { lcmAll, runMain, } from "../util.ts";
import { ModuleNetwork, Pulse, buttonPulse, parseInput, } from './part1.ts';
import * as pt1 from './part1.ts';

function traceback(network:ModuleNetwork) {
    const goal:Pulse = {
        src: "dt",
        dest: "rx",
        type: "L"
    };

    const curName = goal.src
    const cur = network.get(curName)!;

    const conj = cur as pt1.ConjunctionModule;

    const inputs = Object.keys(conj.extractState())

    return inputs.map(src=>({src, dest:"*", type: "H" as pt1.PulseType}))
}

function matches(p:Pulse, pat:Partial<Pulse>) {
    for(const [k,v] of Object.entries(pat)) {
        const val = p[k as keyof Pulse];

        if(val !== v && v !== "*")
            return false;
    }
    return true;
}

function pushButton(network:ModuleNetwork, toWatchFor:Partial<Pulse>[] ) {
    const searchResults = toWatchFor.map(pattern=>({pattern, seen: false}));

    const pulseQueue:Pulse[] = [];

    pulseQueue.push(buttonPulse);

    while(pulseQueue.length > 0) {
        const curPulse = pulseQueue.shift()!;

        for(const pat of searchResults) {
            if(pat.seen) continue;
            if(matches(curPulse, pat.pattern))
               pat.seen = true;
        }

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

    return { searchResults }
}

function bruteForceSearch(network:ModuleNetwork, targets:Partial<Pulse>[], iterations:number) {
    const findings = targets.map(pattern=>({pattern, seenAt: [] as number[]}));

    let pushes = 0;

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

    const targets = traceback(modules);

    //console.log(traceback);

    const results = bruteForceSearch(modules,targets,50_000);

    //console.log(results);

    const r2 = results.map(({pattern,seenAt})=>({pattern, holds: confirmPattern(seenAt)}));

    console.log(r2);

    const answer = lcmAll(r2.map(r=>r.holds.interval));

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
