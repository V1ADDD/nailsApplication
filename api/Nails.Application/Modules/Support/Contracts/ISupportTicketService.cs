using Nails.Application.Modules.Support.Requests;
using Nails.Application.Modules.Support.Responses;

namespace Nails.Application.Modules.Support.Contracts;

public interface ISupportTicketService
{
    Task<CreateSupportTicketResponse> CreateAsync(CreateSupportTicketRequest request, CancellationToken cancellationToken);
}
