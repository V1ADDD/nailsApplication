using Nails.Infrastructure.Modules.Masters.Entities;

namespace Nails.Application.Modules.Masters.Seed;

public sealed record DemoReview(string Master, string Client, Party Author, string SubcategoryId, int Rating, string Text, DateTimeOffset At);
