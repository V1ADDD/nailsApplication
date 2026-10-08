namespace Nails.Application.Modules.Masters.Rules;

public static class MasterMatch
{
    public static bool Offer(string? categoryId, string? serviceId, string offerCategoryId, string offerServiceId) =>
        (categoryId is null || string.Equals(categoryId, offerCategoryId, StringComparison.Ordinal))
        && (serviceId is null || string.Equals(serviceId, offerServiceId, StringComparison.Ordinal));
}
