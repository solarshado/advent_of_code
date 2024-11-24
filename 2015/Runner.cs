namespace AoC2015;

using System.Reflection;
using System.Net.Http;

static class Runner {
    const string YEAR = "2015";
    static readonly string rootNamespace = typeof(Runner).Namespace!;

    private static string GetProjectRoot() {
        var dir = Directory.GetCurrentDirectory();

        if(!Directory.EnumerateFiles(dir,"*.csproj").Any())
            throw new FileNotFoundException(
                    $"No csproj file found in \"{dir}\". Are you running this program from the right place?");

        return dir;
    }

    enum DataSource {
        Example,
        Full
    }

    static bool TryParseAsDataSource(this string input, out DataSource output) {
        (bool retVal, output) = input.ToLower()[0] switch {
            'e' => (true, DataSource.Example),
            'f' => (true, DataSource.Full),
            _ => (false, (DataSource)(-1))
        };

        return retVal;
    }

    static bool TryParseRunArgs(this string[] args, out int day, out int part, out DataSource dataSource) {
        day = part = 0;
        dataSource = (DataSource)(-1);

        var rawVals =
            args is ["run", _, _, _] ? args.Slice(1, 3) :
            args is [_, _, _] ? args.Slice(0 ,3) :
            (ArraySegment<string>?) null;

        if(rawVals is null)
            return false;

        return
            rawVals is [var rawDay, var rawPart, var dataSrcRaw] &&
                        rawDay.TryParseAsDayNum(out day) &&

                        int.TryParse(rawPart, out part) &&
                        part is ( 1 or 2 ) &&

                        dataSrcRaw.TryParseAsDataSource(out dataSource);
    }

    static bool TryParseAsDayNum(this string str, out int dayNum) {
       return
           int.TryParse(str, out dayNum) &&
           dayNum is ( > 0 and < 26 );
    }

    static ArraySegment<T> Slice<T>(this T[] ary, int start, int len) {
        return new ArraySegment<T>(ary, start, len);
    }

    static void Main(string[] args) {
        if(args.TryParseRunArgs(out var day, out var part, out var dataSource)) {
            RunSolver(day,part,dataSource);
        }
        else if(args is ["init", var rawDay] && rawDay.TryParseAsDayNum(out var dayToInit)) {
            InitDay(dayToInit);
        }
        else if(args is ["getinput", var rawDay2] && rawDay2.TryParseAsDayNum(out var dayToGet)) {
            CreateInputFileForDay(dayToGet);
        }
        else {
            var cmdName = "Runner"; //Environment.GetCommandLineArgs()[0];
            // TODO update this text
            Console.WriteLine($"Usage: {cmdName} [dayNum] [partNum] {{e|f}}");
        }
    }

    static void InitDay(int dayNum) {
        var destDir = Path.Combine(
                GetProjectRoot(),
                $"d{dayNum}");

        if(Directory.Exists(destDir)) {
            Console.WriteLine($"Dir for day {dayNum} already exists! Aborting init.");
            return;
        }

        Directory.CreateDirectory(destDir);

        var files = new ValueTuple<string,Func<string>>[] {
            ("example.txt",()=>""),
            ("Part1.cs",()=>GenSolver(dayNum,1)),
            ("Part2.cs",()=>GenSolver(dayNum,2)),
            ("input.txt",()=>FetchInputTextForDay(dayNum)),
        };

        foreach(var (filename, contentFunc) in files) {
            var fullPath = Path.Combine(destDir, filename);
            File.WriteAllText(fullPath, contentFunc());
        }
    }

    static void CreateInputFileForDay(int dayNum) {
        var destDir = Path.Combine(
                GetProjectRoot(),
                $"d{dayNum}");

        if(!Directory.Exists(destDir)) {
            Console.WriteLine($"Dir for day {dayNum} doesn't exist! Try init'ing it first? Aborting.");
            return;
        }

        var fullPath = Path.Combine(destDir, "input.txt");
        File.WriteAllText(fullPath, FetchInputTextForDay(dayNum));
    }

    static string GenSolver(int day, int part) {
        return $$"""
            namespace {{rootNamespace}}.Day{{day}};

            class Part{{part}} {

                static void Main(string[] inputLines) {
                    /*
                    foreach(var line in inputLines) {
                        var result = ();
                        Console.WriteLine($"Result: {result}");
                    }
                    */
                }
            }
            """;
    }

    static string FetchInputTextForDay(int day) {
        // TODO use cache

        const string sessionCookieFilename = "session.cookie";

        var cookieFile = Path.Combine(GetProjectRoot(),sessionCookieFilename);

        if(!File.Exists(cookieFile))
            throw new FileNotFoundException($"No session cookie file found! Create it at \"{cookieFile}\" and try again.");

        var sessionCookie = File.ReadAllText(cookieFile);

        var url = $"https://adventofcode.com/{YEAR}/day/{day}/input";

        var userAgent = $".NET/8 (github.com/solarshado/advent_of_code)";

        var headers = new[] {
            ("Cookie", "session="+sessionCookie),
            ("User-Agent", userAgent),
        };

        using var client = new HttpClient();
        using var message = new HttpRequestMessage(HttpMethod.Get, url);

        foreach(var (name,value) in headers)
            message.Headers.Add(name,value);

        Console.WriteLine("fetching input...");
        using var response = client.Send(message);

        var content = response.Content.ReadAsStringAsync().Result;

        return content;
    }

    private const BindingFlags flagsForMain = BindingFlags.Static | BindingFlags.NonPublic;

    static void RunSolver(int dayNum, int partNum, DataSource dataSource) {

        var requestedSolverName = $"{rootNamespace}.Day{dayNum}.Part{partNum}";

        var solvers = Assembly.GetExecutingAssembly().GetTypes();

        var requestedSolver =
            solvers.SingleOrDefault(s=> requestedSolverName.Equals(s.FullName));

        if(requestedSolver is null) {
            Console.WriteLine("Solver {0} not found!", requestedSolverName);
            return;
        }

        var solverMethodInfo = requestedSolver.GetMethod("Main", flagsForMain, new[] {typeof(string[])});

        if(solverMethodInfo is null) {
            Console.WriteLine("Solver {0} has no static Main(string[]) method!", requestedSolverName);
            return;
        }

        var solverDelegate = solverMethodInfo.CreateDelegate<Action<string[]>>();

        solverDelegate(LoadDataLines(dayNum, partNum, dataSource));
    }

    static string[] LoadDataLines(int dayNum, int partNum, DataSource dataSource) {
        var pathToFile = Path.Combine(
                GetProjectRoot(),
                $"d{dayNum}",
#pragma warning disable 8524
                dataSource switch {
                    DataSource.Example => "example.txt",
                    DataSource.Full => "input.txt",
                });
#pragma warning restore 8524
        return File.ReadAllLines(pathToFile);
    }
}
