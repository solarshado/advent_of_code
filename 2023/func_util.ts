
export const memoCacheSym = Symbol();

type MemoizeReturn<T extends (...params:unknown[])=>unknown,K,V extends ReturnType<T>> = T & { [key in typeof memoCacheSym]: Map<K,V> }

export function memozie<
    // deno-lint-ignore no-explicit-any
    T extends (...args:any[])=>any,
    U extends Parameters<T>,
    V extends ReturnType<T>,
    K=string
>(
    func:T,
    cacheKeyFunc?:(...params:U)=>K
):MemoizeReturn<T,K,V> {
    cacheKeyFunc = cacheKeyFunc ??
        ((...args:U[]):K => args.map(a=>""+a).join("|") as K);

    const cache = new Map<K,V>();

    const memd = ((...args:U) => {
        const key = cacheKeyFunc!(...args);

        if(cache.has(key))
            return cache.get(key)!;

        const val = func(...args) as V;
        cache.set(key, val);
        return val;
    }) as MemoizeReturn<T,K,V> ;
    memd[memoCacheSym] = cache;

    return memd;
}

export function pipe<A,B>(data:A, f1:(a:A)=>B):B;
export function pipe<A,B,C>(data:A, f1:(a:A)=>B, f2:(b:B)=>C):C;
export function pipe<A,B,C,D>(data:A, f1:(a:A)=>B, f2:(b:B)=>C, f3:(c:C)=>D):D;
export function pipe<A,B,C,D,E>(data:A, f1:(a:A)=>B, f2:(b:B)=>C, f3:(c:C)=>D, f4:(d:D)=>E):E;
// TODO more?

export function pipe(data:unknown, ...funcs:Array<(input:unknown)=>unknown>):unknown {
    return funcs.reduce((acc,cur)=>cur(acc), data);
}
