import { basename, dirname, join } from "https://deno.land/std@0.208.0/path/mod.ts";

const inputFileName = "input.txt";

const tasks = {
    "init": init,
    "fetch": ()=>fetchInputFile(initishPreamble()),
    "skel": ()=>skel(initishPreamble()),
    "run": ([i,c,f])=>feedFileToFunction(i,c,f),
    "p1e": ()=> feedFileToFunction("example.txt","part1.ts"),
    "p1f": ()=> feedFileToFunction(inputFileName,"part1.ts"),
    "p2e": ()=> feedFileToFunction("example.txt","part2.ts"),
    "p2f": ()=> feedFileToFunction(inputFileName,"part2.ts"),
} as Record<string,(args:string[])=>void>;

function initishPreamble() {
    const init_cwd = chdirToInitCwd();

    return {init_cwd};
}

async function skel({init_cwd}:ReturnType<typeof initishPreamble>) {
    const skelPath = join(init_cwd, "..", "skel")

    for await (const {name, isFile} of Deno.readDir(skelPath)) {
        if(!isFile) continue;

        const srcPath = join(skelPath,name);
        const destPath = join(init_cwd,name);

        //console.log("copying...", srcPath," > ", destPath);
        console.log("copying...", name);

        await Deno.copyFile(srcPath,destPath);
    }

    // create empty example.txt
    await Deno.writeTextFile("example.txt","");
}

async function fetchInputFile({init_cwd}:ReturnType<typeof initishPreamble>) {
    // fetch input.txt
    const inputExists = await (async function exists(file) {
        try {
            await Deno.stat(file);
            return true;
        } catch(e) {
            if (e instanceof Deno.errors.NotFound)
                return false;
            else
                throw e;
        }
    })(inputFileName);

    if(inputExists) {
        console.log("input file exists, skipping fetch");
        return;
    }

    const day = basename(init_cwd).replace("d","");
    const year = basename(dirname(init_cwd));

    // TODO check cache
    console.log("fetching input...");
    const inputUrl = `https://adventofcode.com/${year}/day/${day}/input`;
        const sesionCookie = await Deno.readTextFile(join("..","session.cookie"));

    const userAgent = `Deno/${Deno.version.deno} (github.com/solarshado/advent_of_code)`

    const response = await fetch(inputUrl, {headers: {
        "Cookie":"session="+sesionCookie,
        "User-Agent": userAgent,
    }});

    if(response.status === 404) {
        console.log("input returned HTTP 404! are you sure that puzzle is unlocked?");
        return;
    }

    const data = await response.text();

    //TODO populate cache

    await Deno.writeTextFile(inputFileName,data);
}

export async function init(_args:string[]) {
    const pream = initishPreamble();
    await skel(pream);
    await fetchInputFile(pream);
}

function chdirToInitCwd() {
  const init_cwd = Deno.env.get("INIT_CWD");

  if (typeof init_cwd === "undefined") {
    console.error("failed to find $INIT_CWD!");
    Deno.exit(1);
  }

  Deno.chdir(init_cwd);
  return init_cwd;
}

export function feedFileToFunction(inputFileName:string, codeFileName:string, funcName='main') {
    const init_cwd = chdirToInitCwd();

    (import('file://'+join(init_cwd, codeFileName))).then(async (module:unknown)=>{
        if(!(
            typeof module === "object" &&
            module !== null &&
            funcName in module
        )) {
            console.error(`file '${codeFileName}' does not appear to export a '${funcName}'!`)
            Deno.exit(0);
        }

        const func = (module as {[k:string]: unknown })[funcName];

        if(typeof func != "function") {
            console.error(`file '${codeFileName}': export '${funcName}' is not a function!!`)
            Deno.exit(0);
        }

        const fileLines = (await Deno.readTextFile(inputFileName)).split('\n');

        await func(fileLines);
    },
    reason=>{
        console.error(`failed to import '${codeFileName}': ${reason}`);
        Deno.exit(1);
    });
}

function main() {
    const [subcommand=undefined,...args] = Deno.args;

    if(typeof subcommand === "undefined") {
        console.error("missing subcommand!");
        Deno.exit(1);
    }

    const func = tasks[subcommand];
    if(typeof func !== "function") {
        console.error(`unknown subcommand '${subcommand}', try:\n${Object.keys(tasks).join('\n\t')}`);
        Deno.exit(1);
    }

    func(args);
}

if(import.meta.main)
    main();
