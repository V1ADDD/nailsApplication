namespace Nails.Application.Modules.Masters.ExtensionPoints;

public interface IReplyTimeSource
{
    Task<int?> MedianMinutesAsync(Guid masterId, CancellationToken cancellationToken);
}
