namespace AoC2015.Day4;

using System.Security.Cryptography;
using System.Text;

class Part1 {

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

            /*
            if( i is 609043 or 1048970) {
                Console.WriteLine($"i={i} ; hash = { string.Join(',',hash[0..10].Select(n=>n.ToString()).ToArray())}");
            }
            */

            if( hash is [0,0, <= 0b_0000_1111,..] )
                return i;
        }
        throw new ArgumentException();
    }
}
