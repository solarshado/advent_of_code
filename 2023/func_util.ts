
export const memoCacheSym = Symbol();

type MemoizeReturn<T extends (...params:unknown[])=>unknown,K,V extends ReturnType<T>> = T & { [key in typeof memoCacheSym]: Map<K,V> }

/** @deprecated */
export const memozie = memoize;

export function memoize<
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

// handy "well-known" function types
export type Mapper<T,U> = (t:T)=>U;
export type Predicate<T> = Mapper<T,boolean>;
export type Reducer<T,U> = (acc:T,cur:U)=>T;

// apparently this is the best option for propperly typing this. gross :(
export function pipe<A,B>(data:A, f1:(a:A)=>B):B;
export function pipe<A,B,C>(data:A, f1:(a:A)=>B, f2:(b:B)=>C):C;
export function pipe<A,B,C,D>(data:A, f1:(a:A)=>B, f2:(b:B)=>C, f3:(c:C)=>D):D;
export function pipe<A,B,C,D,E>(data:A, f1:(a:A)=>B, f2:(b:B)=>C, f3:(c:C)=>D, f4:(d:D)=>E):E;
export function pipe<A,B,C,D,E,F>(data:A, f1:(a:A)=>B, f2:(b:B)=>C, f3:(c:C)=>D, f4:(d:D)=>E,
                                  f5:(e:E)=>F):F

export function pipe<A,B,C,D,E,F,G>(data:A, f1:(a:A)=>B, f2:(b:B)=>C, f3:(c:C)=>D, f4:(d:D)=>E,
                                    f5:(e:E)=>F, f6:(f:F)=>G):G

export function pipe<A,B,C,D,E,F,G,H>(data:A, f1:(a:A)=>B, f2:(b:B)=>C, f3:(c:C)=>D, f4:(d:D)=>E,
                                      f5:(e:E)=>F, f6:(f:F)=>G, f7:(g:G)=>H):H

export function pipe<A,B,C,D,E,F,G,H,I>(data:A, f1:(a:A)=>B, f2:(b:B)=>C, f3:(c:C)=>D, f4:(d:D)=>E,
                                        f5:(e:E)=>F, f6:(f:F)=>G, f7:(g:G)=>H, f8:(h:H)=>I):I
// more?

export function pipe(data:unknown, ...funcs:Array<(input:unknown)=>unknown>):unknown {
    return funcs.reduce((acc,cur)=>cur(acc), data);
}
