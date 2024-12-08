namespace AoC2015.Day5;

using System.Text.RegularExpressions;
using System.Collections.Generic;

class Part2 {

    static void Main(string[] inputLines) {
        var ans = inputLines.Select(line=> new { line, isNice = IsNice(line)}).ToArray();
        /*var ans = inputLines.Select(line=> new { line, isNice = RegexMode.IsNice(line)}).ToArray();*/

        /*Console.WriteLine(ans.Select(a=>$"{a.line} => {(a.isNice ? "nice" : "naughty")}").Join("\n"));*/
        Console.WriteLine(ans.Count(a=> a.isNice));
    }

    static bool IsNice(string str) {
        bool foundTwoPair = false;
        bool foundUwU = false;

        var seenPoses = new Dictionary<char,HashSet<int>>();

        for(int i = 0; i < str.Length; i++) {
            char c = str[i];

            if(!seenPoses.ContainsKey(c))
                seenPoses[c] = new HashSet<int>();

            seenPoses[c].Add(i);

            if(!foundUwU) {
                if(seenPoses[c].Contains(i-2))
                    foundUwU = true;
            }

            if(!foundTwoPair && i >= 3) {
                char prev = str[i-1];

                var prevIdxs = seenPoses[prev].Where(pi=>pi<i-2);

                if(prevIdxs.Any(pi=>str[pi+1] == c))
                    foundTwoPair = true;
            }

            if(foundTwoPair && foundUwU)
                return true;
        }
        return false;
    }

    static class RegexMode {
        static readonly Regex
            twoPair = new Regex(@"(..).*?\1"),
            o_o = new Regex(@"(.).\1");
        public static bool IsNice(string str) {
            return
                twoPair.IsMatch(str) &&
                o_o.IsMatch(str);
        }
    }
}
