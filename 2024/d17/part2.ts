import { runMain, } from "../util.ts";
import { genPairs, reduce, toArray } from "../iter_util.ts";
import { Computer, instructionsByOpcode, parseInput } from './part1.ts';

function printProg({programRaw}:Computer) {
    for(let i = 0 ; i < programRaw.length; ++i) {
        const op = programRaw[i], par = programRaw[++i];
        const inst = instructionsByOpcode[op].name;

        console.log({inst,par});
    }
}

export function* zipIterators<T,U>(l:Iterable<T>, r:Iterable<U>) {
    const li = Iterator.from(l);
    const ri = Iterator.from(r);

    let i = 0;
    while(true) {
        const ln = li.next();
        const rn = ri.next();

        if(ln === undefined && rn === undefined)
            return;
        else
            yield [ln.value,rn.value, i++] as const;
    }
}

function bruteForceFindQuine3(goal:number[]) {

    function checkQuine(A:bigint) {
        const runResult = [... runBI(A)];

        if(goal.length < runResult.length)
            return {A, error: "too high"};
        //if(goal.length > runResult.length)
        //    return {A, error: "too low"};

        let prefix = 0, total = 0, fails = 0, which = 0

        for(const [p,o,i] of zipIterators(goal,runResult)) {
            if(p === undefined || o === undefined)
                break;
            if(BigInt(p!)===o) {
                ++total;
                which |= 1 << i;
                if(fails === 0)
                    ++prefix;
            }
            else
                ++fails;
        }

        return {A, prefix, total,
            which: which.toString(2).split("").reverse().join(""),
            isExact() { return total == goal.length}
        };
    }

    //const top = (1n << 49n) - 1n;
    const bottom = (1n << 47n) + 1n;

    const A = 58549978369801n;
    let genePool = [A, A/2n, A*2n, 58549836772105n, /*top,*/ bottom, ];

    let lastGenePool = new Set(genePool);

    while(true) {
        const results = genePool.map(checkQuine)
                        .filter(r=>r.total !== undefined)
                        .filter(r=>r.total > 0)
                        .toSorted((l,r)=>r.total-l.total || Number(l.A-r.A));

        const top5 = results.slice(0,5)

        if(results[0].isExact() && results[0].A < 105734774296321n)
            return results[0].A;

        const newGenePool = reduce(genPairs(toArray(Iterator.from(results).take(1000))),
            (acc,[l,r])=>{
                acc.add((l.A+r.A)/2n);
                acc.add(l.A|r.A)
                acc.add(l.A&r.A)
                acc.add(l.A);
                acc.add(r.A);
                
                for(const i of [l,r])
                    for(const fac of [-3,-2,-1,1,2,3])
                        acc.add(i.A + (1n << BigInt(i.prefix * fac)));

                return acc;
            }, new Set<bigint>());

        console.log({curSz: genePool.length, nextSz: newGenePool.size, prevSz: lastGenePool.size});

        if(newGenePool.difference(lastGenePool).size == 0) {

            for(const {A,which} of top5) {
                const Ab = A.toString(8);
                //const bits = A.toString(2).length;

                console.log({A,Ab,which});
            }


            throw "gene pool stagnant!"
        }

        lastGenePool = new Set(genePool);
        genePool = toArray(newGenePool);
    }
}

function* run (a:number) {
    let b = 0, c = 0;

    // divBy(2^x) ~= rightShift(x) ... right?

    do {
        //B = A % 8
        b = a % 8
        //B^=5
        b ^= 5
        //c=a/(combo: 2**B)
        c = Math.trunc(a/(2**b))
        // b^=c
        b ^= c
        //B^=6                  b = 2 ^ 6 
        b ^= 6                  
        //A=a/(2**3)            ??  a_init >= (2**3)**16 [progLen]
        a = Math.trunc(a/(2**3))
        // out<<(b%8)           b = 2
        yield b % 8;
        //goto 0 if a!=0
    } while(a!=0);
}

function* runBI(a:bigint) {
    let b = 0n;

    do {
        b = a % 8n
        b ^= 5n
        b ^= (a/(2n**b))
        b ^= 6n
        a = (a/(2n**3n))
        yield b % 8n;
    } while(a!=0n);
}

function prog() {
    const p = [
 ,0,{ inst: "bst", par: 4 }, //B = A % 8
 ,1,{ inst: "bxl", par: 5 }, //B^=5
 ,2,{ inst: "cdv", par: 5 }, //c=a/(combo: 2**B)
 ,3,{ inst: "bxc", par: 3 }, // b^=c
 ,4,{ inst: "bxl", par: 6 }, //B^=6
 ,5,{ inst: "adv", par: 3 }, //A=a/(2**3)
 ,6,{ inst: "out", par: 5 }, // out<<(b%8)
 ,7,{ inst: "jnz", par: 0 }, //goto 0 if a!=0
  , ];
}

export async function main(lines:string[]) {
    const cleanedLines = lines.map(l=>l.trim()).filter(l=>l!='');

    const initState = parseInput(cleanedLines);

    console.log(initState);

    printProg(initState);

    //const answer = bruteForceFindQuine(initState);
    const answer = bruteForceFindQuine3(initState.programRaw);
    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
