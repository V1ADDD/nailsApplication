using Nails.Infrastructure.Modules.Chats.Entities;
using Nails.Infrastructure.Modules.Chats.Models;

namespace Nails.Application.Modules.Chats.Rules;

public static class ReplyTime
{
    private const int Half = 2;

    public static int? MedianMinutes(IReadOnlyList<ReplyMessageRow> messages, int minPairs)
    {
        var gaps = new List<double>();

        foreach (var chat in messages.GroupBy(message => message.ChatId))
        {
            DateTimeOffset? waitingSince = null;

            foreach (var message in chat.OrderBy(message => message.SentAt))
            {
                if (message.AuthorRole == ChatRole.Client)
                {
                    waitingSince ??= message.SentAt;
                }
                else if (waitingSince is { } since)
                {
                    gaps.Add((message.SentAt - since).TotalMinutes);
                    waitingSince = null;
                }
            }
        }

        if (gaps.Count < minPairs)
        {
            return null;
        }

        gaps.Sort();
        var middle = gaps.Count / Half;
        var median = gaps.Count % Half == 1 ? gaps[middle] : (gaps[middle - 1] + gaps[middle]) / Half;

        return (int)Math.Round(median, MidpointRounding.AwayFromZero);
    }
}
