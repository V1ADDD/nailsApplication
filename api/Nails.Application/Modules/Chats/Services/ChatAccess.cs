using Nails.Application.Common.Exceptions;
using Nails.Application.Modules.Chats.Contracts;
using Nails.Application.Modules.Identity.Contracts;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Chats.Contracts;
using Nails.Infrastructure.Modules.Chats.Entities;

namespace Nails.Application.Modules.Chats.Services;

public sealed class ChatAccess(ICurrentUser currentUser, IMasterDirectory masters, IChatRepository chats) : IChatAccess
{
    private Guid? _masterId;
    private bool _masterResolved;

    public Guid UserId => currentUser.UserId;

    public async Task<Guid?> MasterIdAsync(CancellationToken cancellationToken)
    {
        if (!_masterResolved)
        {
            _masterId = await masters.MasterOfUserAsync(currentUser.UserId, cancellationToken);
            _masterResolved = true;
        }

        return _masterId;
    }

    public async Task<Guid> SideIdAsync(ChatRole role, CancellationToken cancellationToken) =>
        role == ChatRole.Client
            ? currentUser.UserId
            : await MasterIdAsync(cancellationToken) ?? throw AccessErrors.NotAMaster();

    public async Task<Chat> ChatAsync(Guid chatId, ChatRole role, CancellationToken cancellationToken)
    {
        var chat = await chats.FindAsync(chatId, cancellationToken) ?? throw ChatsErrors.ChatNotFound();
        var masterId = await MasterIdAsync(cancellationToken);
        var isClient = chat.ClientUserId == currentUser.UserId;
        var isMaster = masterId is { } id && chat.MasterId == id;

        if (role == ChatRole.Master && masterId is null)
        {
            throw isClient ? ChatsErrors.OtherRole() : AccessErrors.NotAMaster();
        }

        return (role == ChatRole.Client ? isClient : isMaster) ? chat
            : (role == ChatRole.Client ? isMaster : isClient) ? throw ChatsErrors.OtherRole()
            : throw ChatsErrors.ChatNotFound();
    }

    public async Task<bool> IsAuthorAsync(Chat chat, Message message, CancellationToken cancellationToken) =>
        message.AuthorRole switch
        {
            ChatRole.Client => chat.ClientUserId == currentUser.UserId,
            ChatRole.Master => await MasterIdAsync(cancellationToken) == chat.MasterId,
            _ => false
        };
}
