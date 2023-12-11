//import { readStringDelim } from "https://deno.land/std@0.105.0/io/mod.ts";

/** @deprecated */
export async function linesFrom(source:Deno.Reader = Deno.stdin):Promise<string[]> {
    const { readStringDelim } = await import("https://deno.land/std@0.105.0/io/mod.ts");

    const ret = [];
    const reader = readStringDelim(source, '\n');

    for await (const line of reader) {
        ret.push(line);
    }

    return ret;
}

export type Main = (inputLines:string[])=>Promise<void>;
export async function runMain(main:Main) {
    const [_,mode="e"] = Deno.args;

    const fileToLoad = mode == "m" ? "input.txt" :"example.txt";
    const inputLines = (await Deno.readTextFile(fileToLoad)).split(/\r|\n|\r\n/);

    await main(inputLines);
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


export function setIntersection<T>(a:Set<T>, b:Set<T>):Set<T> {
    const [larger, smaller] = a.size > b.size ? [a,b] : [b,a];

    return new Set(_intersect(larger,smaller))
}
function* _intersect<T>(larger:Set<T>, smaller:Set<T>) {
    for(const item of smaller)
        if(larger.has(item))
            yield item;
}

// these 3 stolen from https://stackoverflow.com/a/61352020/
export const gcd = (a:number, b:number):number => b == 0 ? a : gcd(b, a % b)
export const lcm = (a:number, b:number) =>  a / gcd(a, b) * b
export const lcmAll = (ns:number[]) => ns.reduce(lcm, 1)
