using Nails.Application.Modules.Identity.Contracts;
using Nails.Application.Modules.Support.Contracts;
using Nails.Application.Modules.Support.Requests;
using Nails.Application.Modules.Support.Responses;
using Nails.Infrastructure.Modules.Support.Contracts;
using Nails.Infrastructure.Modules.Support.Entities;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Application.Modules.Support.Services;

public sealed class SupportTicketService(
    ISupportTicketRepository tickets,
    IUnitOfWork unitOfWork,
    ICurrentUser currentUser) : ISupportTicketService
{
    public async Task<CreateSupportTicketResponse> CreateAsync(CreateSupportTicketRequest request, CancellationToken cancellationToken)
    {
        var contact = request.Contact?.Trim();

        var ticket = new SupportTicket
        {
            Id = Guid.CreateVersion7(),
            Text = request.Text.Trim(),
            Contact = string.IsNullOrEmpty(contact) ? null : contact,
            UserId = currentUser.UserId == Guid.Empty ? null : currentUser.UserId,
            Status = SupportTicketStatus.New
        };

        tickets.Add(ticket);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new CreateSupportTicketResponse(ticket.Id);
    }
}
