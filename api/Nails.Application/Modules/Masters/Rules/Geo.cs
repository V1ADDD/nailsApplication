namespace Nails.Application.Modules.Masters.Rules;

public static class Geo
{
    private const double EarthRadiusKm = 6371;
    private const double KmPerDegreeLatitude = 111.32;
    private const double DegreesPerRadian = 180;
    private const int DistanceDecimals = 2;

    public static double DistanceKm(double fromLat, double fromLng, double toLat, double toLng)
    {
        var dLat = Radians(toLat - fromLat);
        var dLng = Radians(toLng - fromLng);
        var h = Math.Pow(Math.Sin(dLat / 2), 2)
            + (Math.Cos(Radians(fromLat)) * Math.Cos(Radians(toLat)) * Math.Pow(Math.Sin(dLng / 2), 2));
        return Math.Round(2 * EarthRadiusKm * Math.Asin(Math.Sqrt(h)), DistanceDecimals);
    }

    public static GeoBox BoxAround(double lat, double lng, double radiusKm)
    {
        var latDelta = radiusKm / KmPerDegreeLatitude;
        var lngDelta = radiusKm / (KmPerDegreeLatitude * Math.Max(Math.Cos(Radians(lat)), double.Epsilon));
        return new GeoBox(lat - latDelta, lat + latDelta, lng - lngDelta, lng + lngDelta);
    }

    private static double Radians(double degrees) => degrees * Math.PI / DegreesPerRadian;
}
