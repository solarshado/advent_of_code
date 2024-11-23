namespace AoC2015.Day1;

class Part1 {

    static void Main(string[] inputLines) {
        foreach(var line in inputLines) {
            int result = line.Aggregate(
                    0,
                    (acc,cur)=> acc + (cur switch {
                        '(' => 1,
                        ')' => -1,
                        _ => throw new ArgumentException()
                        })
                    );
            Console.WriteLine($"Result: {result}");
        }
    }

}
