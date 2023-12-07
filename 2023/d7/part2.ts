import { runMain, } from "../util.ts";
import { HandType, } from './part1.ts';

type InputRow = {
    hand:Hand,
    bid:number
};

type Card = "A"| "K"| "Q"| "J"| "T"| "9"| "8"| "7"| "6"| "5"| "4"| "3"| "2";
const CardValMap = {T:10,J:1,Q:12,K:13,A:14} as const;

function compareCards(l:Card, r:Card) {
    const [a,b] = [l,r].map(v=> v in CardValMap ? +CardValMap[v as keyof typeof CardValMap] : +v);
    const diff = b - a;
    const ret = diff != 0 ? diff/Math.abs(diff) : diff
//    console.log("comparing:",l,r,ret);
    return ret;
}

function determineHandType(cards:Card[]):HandType {
        const counts = cards.reduce((acc,cur)=>{
            acc[cur] = (acc[cur] || 0) + 1;
            return acc;
        },{} as Partial<Record<Card,number>>);

        const entries = Object.entries(counts) as [Card,number][];

        // if any jokers, and not FiveOf
        if(("J" in counts) && entries.length != 1) {
            // all jokers to whichever card there is already the most of
            const [[_,jokerCount]] = entries.splice(entries.findIndex(([c,_])=>c==="J"),1);

            const maxNonJoker = entries.reduce((l,r)=> r[1] > l[1] ? r : l);
            maxNonJoker[1] += jokerCount;
        }

        if(entries.length === 1) {
            return HandType.FiveOf;
        }
        else if (entries.length === 2) {
            return entries.some(([_,c])=>c == 4) ?
                HandType.FourOf :
                HandType.FullHouse;
        }
        else if (entries.length === 3) {
            return entries.some(([_,c])=>c == 3) ?
                HandType.ThreeOf :
                HandType.TwoPair;
        }
        else if (entries.length === 4) {
            return HandType.OnePair;
        }
        else if(entries.length === 5) {
            return HandType.HighCard;
        }
        else { throw "wtf!?" }
}

class Hand {
// ace-high cards
// ranks:
//      5-kind
//      4-kind
//      full house
//      3-kind
//      2-pair
//      1-pair
//      high card
// t2 sort:
//      semi-lexical, first card, second, etc.
    //      could do some careful "custom base" math to order up-front...
private readonly type:HandType;
private readonly cards:Card[];
    constructor(cards:string) {
        this.cards = cards.trim().split("") as Card[];
        this.type = determineHandType(this.cards);
    }

    // sorts high hands last!
    compare(other:Hand):number {
        return (
            this.type != other.type ?
            this.type - other.type : /// flip?
            -this.cards.reduce((acc,cur,i)=> acc != 0 ? acc : compareCards(cur,other.cards[i]) ,0)
        );
    }
}

function parseRow(s:string):InputRow {
    const [hand,bid] = s.split(" ");

    return { bid: +bid, hand: new Hand(hand) };
}

export async function main(lines:string[]) {
    const values = lines.filter(l=>l!='').map(parseRow);

    //console.log(values);

    const ordered = values.sort(({hand:l},{hand:r})=>l.compare(r));

    console.log(ordered);

    const answer = ordered.reduce((acc,cur,i)=>acc+(cur.bid * (i+1)), 0);

    console.log(answer);
}

if(import.meta.main)
    await runMain(main);
