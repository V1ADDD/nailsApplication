using Nails.Infrastructure.Modules.Support.Contracts;
using Nails.Infrastructure.Modules.Support.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Support.Repositories;

public sealed class SupportTicketRepository(AppDbContext dbContext) : ISupportTicketRepository
{
    public void Add(SupportTicket ticket) => dbContext.Set<SupportTicket>().Add(ticket);
}
