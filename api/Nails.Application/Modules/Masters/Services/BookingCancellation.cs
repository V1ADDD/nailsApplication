using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Services;

public sealed record BookingCancellation(Party By, string Reason, bool Mutual, bool Expired);
