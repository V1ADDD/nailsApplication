namespace Nails.Application.Modules.Chats.Responses;

public sealed record CounterpartResponse(
    Guid Id,
    string Name,
    string? PhotoUrl,
    bool IsMaster,
    bool Online,
    string? Subtitle,
    bool Deleted);
