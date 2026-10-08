using Nails.Infrastructure.Modules.Support.Entities;

namespace Nails.Infrastructure.Modules.Support.Contracts;

public interface ISupportTicketRepository
{
    void Add(SupportTicket ticket);
}
