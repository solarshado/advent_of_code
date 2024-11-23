namespace AoC2015.Day2;

class Part2 {

    static void Main(string[] inputLines) {

        var results = new List<int>();

        foreach(var line in inputLines) {

            if(line.Split('x').Select(int.Parse).ToList() is not [var l, var w, var h])
                throw new ArgumentException(line);

            var sides = new[] {
                (l+w)* 2,
                (l+h)* 2,
                (w+h)* 2,
            };

            var smallest = sides.Min();

            var result = smallest + (l*w*h);

            Console.WriteLine(result);
            results.Add(result);
        }

        Console.WriteLine(results.Sum());
    }
}
