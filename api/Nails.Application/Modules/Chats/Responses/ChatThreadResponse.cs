using Nails.Application.Modules.Masters.Contracts;

namespace Nails.Application.Modules.Chats.Responses;

public sealed record ChatThreadResponse(
    ChatResponse Chat,
    CounterpartResponse Counterpart,
    IReadOnlyList<MessageResponse> Messages,
    IReadOnlyList<BookingCard> Bookings,
    bool HasOlder);
