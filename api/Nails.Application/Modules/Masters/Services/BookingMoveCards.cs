using Nails.Application.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Services;

public static class BookingMoveCards
{
    public static BookingMoveCard? From(BookingMove? move) =>
        move is null ? null : new BookingMoveCard(move.StartAt, move.DurationMin, move.LapsesAt, move.Status);
}
