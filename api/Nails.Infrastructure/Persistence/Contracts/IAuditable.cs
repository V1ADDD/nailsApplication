namespace Nails.Infrastructure.Persistence.Contracts;

public interface IAuditable
{
    DateTimeOffset CreatedAt { get; set; }

    DateTimeOffset UpdatedAt { get; set; }
}
