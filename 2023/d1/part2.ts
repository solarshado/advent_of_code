import { linesFrom } from "../util.ts";

const example = `
two1nine
eightwothree
abcone2threexyz
xtwone3four
4nineeightseven2
zoneight234
7pqrstsixteen
`.trim();

export const numberWordMap = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
} as const;
type NumberWord = keyof typeof numberWordMap;
const numberWords = Object.keys(numberWordMap) as  ReadonlyArray<NumberWord>;

export function toNumericDigit(val:any):number {
    const parsed = parseInt(val);
    if(!isNaN(parsed))
        return parsed;
    if(val in numberWordMap)
        return numberWordMap[val as NumberWord];
    throw `can't parse "${val}"`
}

export const matchANumberRegexFragment = `(\\d|${numberWords.join("|")})`;
const firstDigitRegex = new RegExp(matchANumberRegexFragment);
// greedy star Just Works(tm)!
const lastDigitRegex = new RegExp(".*" + matchANumberRegexFragment);

export function getCalibrationValue(line:string):number {
    console.log(`extracing from "${line}"`)

    const firstDigitRaw = firstDigitRegex.exec(line)![1];
    const lastDigitRaw = lastDigitRegex.exec(line)![1];

    const [firstDigit, lastDigit] = [firstDigitRaw, lastDigitRaw].map(toNumericDigit);

    console.log(`extracing from "${line}": got "${firstDigit}" and "${lastDigit}"`)

    return +(firstDigit + "" + lastDigit);
}

export async function main() {
    const lines = await linesFrom();
    //const lines = example.split('\n');

    const values = lines.filter(l=>l!='').map(getCalibrationValue);

    const result = values.reduce((l,r)=>l+r);

    console.log(result);
}

if(import.meta.main)
    await main();
