using Nails.Application.Modules.Identity.Contracts;

namespace Nails.Api.Host.Middleware;

public sealed class PresenceMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, ICurrentUser currentUser, IPresence presence)
    {
        if (currentUser.UserId != Guid.Empty)
        {
            await presence.TouchAsync(currentUser.UserId, context.RequestAborted);
        }

        await next(context);
    }
}
