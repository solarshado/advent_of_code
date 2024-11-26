namespace AoC2015.Day3;

using Point = (int,int);

class Part1 {

    static void Main(string[] inputLines) {
        foreach(var line in inputLines) {
            var result = Travel(line.ToArray());
            Console.WriteLine($"Result: {result}");
        }
    }

    static int Travel(char[] steps) {
        var visited = new HashSet<Point>();

        Point curPos = (0,0);
        visited.Add(curPos);

        foreach(var d in steps) {
            curPos = Add(curPos, d switch {
                        '>' => (1,0),
                        '<' => (-1,0),
                        '^' => (0,1),
                        'v' => (0,-1),
                    });

            visited.Add(curPos);
        }

        return visited.Count;
    }

    static Point Add(Point p1, Point p2) {
        return ( p1.Item1 + p2.Item1, p1.Item2 + p2.Item2);
    }
}
