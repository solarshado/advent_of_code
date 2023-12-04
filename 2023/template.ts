import { linesFrom } from "../util.ts";

const example = `
`.trim();

function foo() {

}

async function main() {
    const lines = await linesFrom();
    //const lines = example.split('\n');

    //const values = lines.filter(l=>l!='').map(getCalibrationValue);

    //const result = values.reduce((l,r)=>l+r);

    console.log(result);
}

if(import.meta.main)
    await main();
