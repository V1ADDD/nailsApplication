using Nails.Application.Modules.Masters.Contracts;

namespace Nails.Application.Modules.Chats.Responses;

public sealed record BookingChangedEvent(Guid? ChatId, BookingCard Booking);
