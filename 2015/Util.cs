namespace AoC2015.Util;

public static class LinqExtras {
    public static string Join<T>(this IEnumerable<T> src, string sep) {
       return string.Join(sep, src);
    }
    public static string Join<T>(this IEnumerable<T> src, char sep) {
       return string.Join(sep, src);
    }
}
