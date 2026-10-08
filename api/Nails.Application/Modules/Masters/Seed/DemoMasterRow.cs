namespace Nails.Application.Modules.Masters.Seed;

public sealed class DemoMasterRow
{
    public required string Slug { get; init; }

    public required string Name { get; init; }

    public int? Photo { get; init; }

    public required IReadOnlyList<string> CategoryIds { get; init; }

    public required string Specialty { get; init; }

    public required string City { get; init; }

    public required string District { get; init; }

    public required string Address { get; init; }

    public required double Lat { get; init; }

    public required double Lng { get; init; }

    public required double Rating { get; init; }

    public required int Reviews { get; init; }

    public required int Experience { get; init; }

    public required bool Verified { get; init; }

    public required int Bookings { get; init; }

    public required string About { get; init; }

    public string? Telegram { get; init; }

    public string? Instagram { get; init; }

    public required bool Viber { get; init; }

    public required int Portfolio { get; init; }

    public required IReadOnlyList<DemoServiceRow> Services { get; init; }
}
