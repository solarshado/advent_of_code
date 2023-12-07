import { basename, dirname, join } from "https://deno.land/std@0.208.0/path/mod.ts";

const inputFileName = "input.txt";

const tasks = {
    "init": init,
    "run": ([i,c,f])=>feedFileToFunction(i,c,f),
    "p1e": ()=> feedFileToFunction("example.txt","part1.ts"),
    "p1f": ()=> feedFileToFunction(inputFileName,"part1.ts"),
    "p2e": ()=> feedFileToFunction("example.txt","part2.ts"),
    "p2f": ()=> feedFileToFunction(inputFileName,"part2.ts"),
} as Record<string,(args:string[])=>void>;

export async function init(_args:string[]) {
    const init_cwd = chdirToInitCwd();

    const skelPath = join(init_cwd, "..", "skel")

    for await (const {name, isFile} of Deno.readDir(skelPath)) {
        if(!isFile) continue;

        const srcPath = join(skelPath,name);
        const destPath = join(init_cwd,name);

        console.log("copying...", srcPath," > ", destPath);

        await Deno.copyFile(srcPath,destPath);
    }

    const day = basename(init_cwd).replace("d","");
    const year = basename(dirname(init_cwd));

    // create empty example.txt
    await Deno.writeTextFile("example.txt","");

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

    if(!inputExists) {
        console.log("fetching input...");
        const inputUrl = `https://adventofcode.com/${year}/day/${day}/input`;
        const sesionCookie = await Deno.readTextFile(join("..","session.cookie"));

        const userAgent = `Deno/${Deno.version.deno} github.com/solarshado/advent_of_code`

        const response = await fetch(inputUrl, {headers: {
            "Cookie":"session="+sesionCookie,
            "User-Agent": userAgent,
        }});

        const data = await response.text();

        await Deno.writeTextFile(inputFileName,data);
    }
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
