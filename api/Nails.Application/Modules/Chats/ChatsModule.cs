using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nails.Application.Common.Modules;
using Nails.Application.Common.Realtime;
using Nails.Application.Modules.Chats.Contracts;
using Nails.Application.Modules.Chats.Options;
using Nails.Application.Modules.Chats.Responses;
using Nails.Application.Modules.Chats.Seed;
using Nails.Application.Modules.Chats.Services;
using Nails.Application.Modules.Masters.Events;
using Nails.Application.Modules.Masters.ExtensionPoints;
using Nails.Infrastructure.Common;
using Nails.Infrastructure.Modules.Chats.Contracts;
using Nails.Infrastructure.Modules.Chats.Repositories;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Application.Modules.Chats;

public sealed class ChatsModule : IAppModule
{
    public string Name => "Chats";

    public bool AlwaysOn => false;

    public IReadOnlyList<string> DependsOn => ["Masters"];

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatedOptions<ChatMessagesOptions>(configuration, ChatMessagesOptions.SectionName);
        services.AddValidatedOptions<ReplyTimeOptions>(configuration, ReplyTimeOptions.SectionName);
        services.AddScoped<IChatRepository, ChatRepository>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        services.AddScoped<IChatAccess, ChatAccess>();
        services.AddScoped<ChatViews>();
        services.AddScoped<ChatEvents>();
        services.AddScoped<IChatService, ChatService>();
        services.AddScoped<IMessageService, MessageService>();
        services.AddScoped<IBookingChangedHandler, BookingChatHandler>();
        services.AddScoped<IReplyTimeSource, ReplyTimeSource>();
        services.AddScoped<IDemoSeeder, ChatsDemoSeeder>();
        services.AddRealtimeEvent<MessageCreatedEvent>();
        services.AddRealtimeEvent<MessageUpdatedEvent>();
        services.AddRealtimeEvent<ChatReadEvent>();
        services.AddRealtimeEvent<ChatChangedEvent>();
        services.AddRealtimeEvent<BookingChangedEvent>();
        services.AddRealtimeEvent<UnreadChangedEvent>();
    }
}
