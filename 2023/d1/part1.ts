import { linesFrom } from '../util.ts';

const example =`
1abc2
pqr3stu8vwx
a1b2c3d4e5f
treb7uchet
`.trim();

function getCalibrationValue(line:string):number {
    //console.log(`extracing from "${line}"`)
    const firstDigit = /(\d)/.exec(line)![1];

    // greedy star Just Works(tm)?
    const lastDigit = /.*(\d)/.exec(line)![1];

    return +(firstDigit + "" + lastDigit);
}

async function main() {
    const lines = await linesFrom();
    //const lines = example.split('\n');

    const values = lines.filter(l=>l!='').map(getCalibrationValue);

    const result = values.reduce((l,r)=>l+r);

    console.log(result);
}

if(import.meta.main)
    await main();
