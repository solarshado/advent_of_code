namespace AoC2015.Day1;

class Part2 {

    static void Main(string[] inputLines) {
        foreach(var line in inputLines) {
            var result = line.Aggregate(
                    (acc: 0, pos: 0, result: -1),
                    (acc,cur)=> {

                    if(acc.result != -1)
                        return acc;

                    acc.pos++;
                    acc.acc += (cur switch {
                            '(' => 1,
                            ')' => -1,
                            _ => throw new ArgumentException()
                            });

                    if(acc.acc == -1 && acc.result == -1)
                        acc.result = acc.pos;

                    return acc;
                    });
            Console.WriteLine($"Result: {result.result}");
        }
    }
}
