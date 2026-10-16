using Microsoft.Extensions.Options;
using Nails.Application.Modules.Chats.Options;
using Nails.Application.Modules.Chats.Rules;
using Nails.Application.Modules.Masters.ExtensionPoints;
using Nails.Infrastructure.Modules.Chats.Contracts;

namespace Nails.Application.Modules.Chats.Services;

public sealed class ReplyTimeSource(IMessageRepository messages, TimeProvider clock, IOptions<ReplyTimeOptions> options) : IReplyTimeSource
{
    public async Task<int?> MedianMinutesAsync(Guid masterId, CancellationToken cancellationToken)
    {
        var settings = options.Value;
        var since = clock.GetUtcNow().AddDays(-settings.WindowDays);
        var rows = await messages.ReplyMessagesAsync(masterId, since, cancellationToken);

        return ReplyTime.MedianMinutes(rows, settings.MinPairs);
    }
}
