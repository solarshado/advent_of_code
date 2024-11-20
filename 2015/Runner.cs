namespace AoC2015;

using System.Reflection;

static class Runner {

    private const BindingFlags flagsForMain = BindingFlags.Static | BindingFlags.NonPublic;

    enum DataSource {
        Example,
        Full
    }

    static bool TryParseAsDataSource(this string input, out DataSource output) {
        switch(input.ToLower()[0]) {
            case 'e': 
                output = DataSource.Example;
                return true;

            case 'f':
                output = DataSource.Full;
                return true;

            default:
                output = (DataSource)(-1);
                return false;
        }
    }

    static void Main(string[] args) {

        // TODO refactor to handle subcommands:
        // run [day] [part] [data]
        //     runs the specified solver
        //     default to this if "run" is omitted
        // init [day]
        //     setups up the specified day: copy template source files and fetch input data

        if( args is not [var day, var part, var dataSrcRaw] ||

            !int.TryParse(day, out var dayNum) ||
            dayNum is ( < 1 or > 25 ) ||

            !int.TryParse(part, out var partNum) ||
            partNum is not ( 1 or 2 ) ||

            !dataSrcRaw.TryParseAsDataSource(out var dataSource)
          ) {
            Console.WriteLine("Usage: Runner [dayNum] [partNum] {e|f}");
            return;
        }

        var namespacePrefix = typeof(Runner).Namespace;

        var requestedSolverName = $"{namespacePrefix}.Day{dayNum}.Part{partNum}";

        var solvers = Assembly.GetExecutingAssembly().GetTypes();

        var requestedSolver =
            solvers.SingleOrDefault(s=> s.FullName.Equals(requestedSolverName));

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
                dataSource switch {
                    DataSource.Example => "example.txt",
                    DataSource.Full => "input.txt",
                });
        return File.ReadAllLines(pathToFile);
    }
}
