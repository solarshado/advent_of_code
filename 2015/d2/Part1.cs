namespace AoC2015.Day2;

class Part1 {

    static void Main(string[] inputLines) {

        var results = new List<int>();

        foreach(var line in inputLines) {

            if(line.Split('x').Select(int.Parse).ToList() is not [var l, var w, var h])
                throw new ArgumentException(line);

            var sides = new[] {
                l*w,
                l*h,
                w*h
            };

            var smallest = sides.Min();

            var result = (sides.Sum() * 2) + smallest;

            //Console.WriteLine(result);
            results.Add(result);
        }

        Console.WriteLine(results.Sum());
    }
}
