namespace AoC2015.Day4;

using System.Security.Cryptography;
using System.Text;

class Part2 {

    static void Main(string[] inputLines) {
        foreach(var line in inputLines) {
            var result = FindHash(line);
            Console.WriteLine($"Result: {result}");
        }
    }

    static uint FindHash(string prefix) {

        var prefixBytes = Encoding.UTF8.GetBytes(prefix);

        using MD5 md5 = MD5.Create();

        for(uint i = 1; i < uint.MaxValue; i++) {
            var tail = Encoding.UTF8.GetBytes(i.ToString());
            var hash = md5.ComputeHash(prefixBytes.Concat(tail).ToArray())!;

            if( hash is [0,0,0,..] )
                return i;
        }
        throw new ArgumentException();
    }
}
