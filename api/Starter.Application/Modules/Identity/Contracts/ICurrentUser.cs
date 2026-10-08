namespace Starter.Application.Modules.Identity.Contracts;

public interface ICurrentUser
{
    Guid UserId { get; }
}
