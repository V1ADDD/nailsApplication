namespace Nails.Infrastructure.Persistence.Contracts;

public interface IVersioned
{
    long Version { get; set; }
}
