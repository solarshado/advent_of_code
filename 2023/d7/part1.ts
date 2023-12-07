import { runMain, } from "../util.ts";

export type InputRow = {
    hand:Hand,
    bid:number
};

export enum HandType {
    FiveOf = 0,
    FourOf = -1,
    FullHouse = -2,
    ThreeOf = -3,
    TwoPair = -4,
    OnePair = -5,
    HighCard = -6,
}

export type Card = "A"| "K"| "Q"| "J"| "T"| "9"| "8"| "7"| "6"| "5"| "4"| "3"| "2";
const CardValMap = {T:10,J:11,Q:12,K:13,A:14} as const;

export function compareCards(l:Card, r:Card) {
    const [a,b] = [l,r].map(v=> v in CardValMap ? +CardValMap[v as keyof typeof CardValMap] : +v);
    const diff = b - a;
    const ret = diff != 0 ? diff/Math.abs(diff) : diff
//    console.log("comparing:",l,r,ret);
    return ret;
}

export class Hand {
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
        const counts = this.cards.reduce((acc,cur)=>{
            acc[cur] = (acc[cur] || 0) + 1;
            return acc;
        },{} as Record<string,number>);

        const entries = Object.entries(counts);

        if(entries.length === 1) {
            this.type = HandType.FiveOf;
        }
        else if (entries.length === 2) {
            this.type =
                entries.some(([_,c])=>c == 4) ?
                HandType.FourOf :
                HandType.FullHouse;
        }
        else if (entries.length === 3) {
            this.type =
                entries.some(([_,c])=>c == 3) ?
                HandType.ThreeOf :
                HandType.TwoPair;
        }
        else if (entries.length === 4) {
            this.type = HandType.OnePair;
        }
        else if(entries.length === 5) {
            this.type = HandType.HighCard;
        }
        else { throw "wtf!?" }
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

export function parseRow(s:string):InputRow {
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
