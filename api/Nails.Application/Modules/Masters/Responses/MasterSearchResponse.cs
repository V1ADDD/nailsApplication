namespace Nails.Application.Modules.Masters.Responses;

public sealed record MasterSearchResponse(
    int Total,
    int OnlineCount,
    IReadOnlyList<MasterCardResponse> Items,
    IReadOnlyList<MapPinResponse> Pins);
