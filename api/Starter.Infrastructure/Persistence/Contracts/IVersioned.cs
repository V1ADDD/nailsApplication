namespace Starter.Infrastructure.Persistence.Contracts;

public interface IVersioned
{
    long Version { get; set; }
}
