namespace AoC2015;

using System.Reflection;

static class Runner {

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
        else {
            var cmdName = "Runner"; //Environment.GetCommandLineArgs()[0];
            // TODO update this text
            Console.WriteLine($"Usage: {cmdName} [dayNum] [partNum] {{e|f}}");
        }
    }

    static void InitDay(int dayNum) {
        // TODO
        // create subdir
        // copy/transform template
        // get input.txt, either from cache or web
        //      latter will require reading a session cookie
    }


    private const BindingFlags flagsForMain = BindingFlags.Static | BindingFlags.NonPublic;

    static void RunSolver(int dayNum, int partNum, DataSource dataSource) {

        var namespacePrefix = typeof(Runner).Namespace;

        var requestedSolverName = $"{namespacePrefix}.Day{dayNum}.Part{partNum}";

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
                Directory.GetCurrentDirectory(),
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
