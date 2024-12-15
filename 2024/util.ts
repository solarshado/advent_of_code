import { Predicate } from "./func_util.ts";

export type Main = (inputLines:string[])=>Promise<void>;
export async function runMain(main:Main) {
    const [_,mode="e"] = Deno.args;

    const fileToLoad = mode == "m" ? "input.txt" :"example.txt";
    const inputLines = (await Deno.readTextFile(fileToLoad)).split(/\r|\n|\r\n/);

    await main(inputLines);
}

export function yeet<T>(...t:T[]):never {
    throw t;
}

export function sortedNumeric(src:number[], descending=false) {
    return src.toSorted(
        descending ?
            (a,b)=>b-a :
            (a,b)=>a-b
    );
}

export function sum(nums:number[], mapper?:((v:number)=>number)):number;
export function sum<T>(nums:T[], mapper:((v:T)=>number)):number;

export function sum<T>(nums:T[], mapper?:((v:T)=>number)):number
{
    const reducer:(acc:number,curr:T)=>number =
        typeof mapper === "function" ?
        (acc,curr)=> acc + mapper(curr) :
        (acc,curr)=> acc + +curr;

    return nums.reduce(reducer,0);
}

export function product(nums:number[], mapper?:((v:number)=>number)):number;
export function product<T>(nums:T[], mapper:((v:T)=>number)):number;

export function product<T>(nums:T[], mapper?:((v:T)=>number)):number
{
    const reducer:(acc:number,curr:T)=>number =
        typeof mapper === "function" ?
        (acc,curr)=> acc * mapper(curr) :
        (acc,curr)=> acc * +curr;

    return nums.reduce(reducer,1);
}

export function arraysEqual<T>(l:T[], r:T[]):boolean {
    return l.length == r.length &&
        l.every((e,i)=> e === r[i]);
}

export function countDifferingElements<T>(l:T[], r:T[]):number {
    // TODO? allow differing lengths?
    return l.length == r.length ?
        l.reduce((acc,curL,i)=> acc + (curL === r[i] ? 0 : 1), 0) :
        Math.max(l.length,r.length)
}

export function splitArray<T>(src:T[], pred:Predicate<T>):T[][]
export function splitArray<T>(src:T[], elem:T):T[][]

export function splitArray<T>(src:T[], splitter:T|Predicate<T>):T[][] {
    const pred =
        typeof splitter !== "function" ?
        (t:T)=>t===splitter :
        splitter as Predicate<T>;

    return src.reduce((acc,cur)=>{
        if(pred(cur)) {
            acc.push([]);
        }
        else {
            acc.at(-1)!.push(cur)
        }

        return acc;
    },[[]] as T[][])
}

export function joinArrays<T>(src:T[][], elem:T):T[] {
    return src.reduce((l,r)=>l.concat(elem, ...r));
}

// these 3 stolen from https://stackoverflow.com/a/61352020/
export const gcd = (a:number, b:number):number => b == 0 ? a : gcd(b, a % b)
export const lcm = (a:number, b:number) =>  a / gcd(a, b) * b
export const lcmAll = (ns:number[]) => ns.reduce(lcm, 1)

// translated from  https://stackoverflow.com/a/1082938/
export function positiveModulo(x:number, m:number) {
    return (x%m + m)%m;
}

