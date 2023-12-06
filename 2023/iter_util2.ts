export {range, concat, count} from './iter_util.ts';

export function* map<T,U>(iter:Iterable<T>, mapper:(item:T)=>U) {
    for(const item of iter)
        yield mapper(item);
}

export function* filter<T>(iter:Iterable<T>, predecate:(item:T)=>boolean) {
    for(const item of iter)
        if(predecate(item))
            yield item;
}

export function reduce<T,U>(iter:Iterable<U>, reducer:(acc:T,cur:U)=>T, seed:T) {
    let acc = seed;
    for(const item of iter)
        acc = reducer(acc,item);

    return acc;
}
