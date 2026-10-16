using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence;

namespace Nails.Infrastructure.Modules.Masters.Repositories;

public static class MasterVisibility
{
    public static IQueryable<Master> Listed(this IQueryable<Master> masters, AppDbContext dbContext) =>
        masters.Where(master => master.DeletedAt == null
            && master.LocationSet
            && dbContext.Set<MasterService>().Any(service => service.MasterId == master.Id));

    public static IQueryable<Master> VisibleTo(this IQueryable<Master> masters, AppDbContext dbContext, Guid viewerUserId) =>
        masters.Where(master => master.DeletedAt == null
            && (master.UserId == viewerUserId
                || (master.LocationSet && dbContext.Set<MasterService>().Any(service => service.MasterId == master.Id))));
}
