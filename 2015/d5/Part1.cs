namespace AoC2015.Day5;

using AoC2015.Util;
using System.Text.RegularExpressions;

class Part1 {

    static void Main(string[] inputLines) {
        /*var ans = inputLines.Select(line=> new { line, isNice = IsNice(line)}).ToArray();*/
        var ans = inputLines.Select(line=> new { line, isNice = RegexMode.IsNice(line)}).ToArray();
        /*Console.WriteLine(ans.Select(a=>$"{a.line} => {(a.isNice ? "nice" : "naughty")}").Join("\n"));*/
        Console.WriteLine(ans.Count(a=> a.isNice));
    }

    static readonly string[] ForbiddenPairs = new[] {
        "ab","cd","pq","xy",
    };

    static bool IsNice(string str) {
        int vowelCount = 0;
        bool foundDouble = false;
        char prevChar = '\0';

        foreach(var c in str) {
            if( c is 'a' or 'e' or 'i' or 'o' or 'u')
                vowelCount++;

            if(c == prevChar)
                foundDouble = true;

            var thisPair = prevChar + "" + c;
            if(ForbiddenPairs.Any(p=>p.Equals(thisPair)))
                return false;

            prevChar = c;
        }

        return foundDouble && vowelCount >= 3;
    }

    static class RegexMode {
        static readonly Regex
            threeVowels = new Regex(@"(.*?[aeiou]){3}"),
            doubleLeter = new Regex(@"(.)\1"),
            forbiddenPairs = new Regex(ForbiddenPairs.Join("|"));
        public static bool IsNice(string str) {
            return
                !forbiddenPairs.IsMatch(str) &&
                threeVowels.IsMatch(str) &&
                doubleLeter.IsMatch(str);
        }
    }
}
