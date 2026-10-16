using Microsoft.Extensions.Options;
using Nails.Application.Common.Exceptions;
using Nails.Application.Modules.Catalog.Contracts;
using Nails.Application.Modules.Identity.Contracts;
using Nails.Application.Modules.Identity.Responses;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Options;
using Nails.Application.Modules.Masters.Requests;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Application.Modules.Masters.Services;

public sealed class MasterOnboardingService(
    IOnboardingRepository onboarding,
    IAccountDirectory accounts,
    IAccountLinks links,
    ISessionService sessions,
    ICatalog catalog,
    ICurrentUser currentUser,
    IUnitOfWork unitOfWork,
    IOptions<CitiesOptions> cities,
    IOptions<NewMasterOptions> defaults) : IMasterOnboardingService
{
    private const string CategoryField = "categoryId";
    private const string CityField = "city";
    private const string AddressField = "address";

    public IReadOnlyList<string> Cities() => [.. cities.Value.Items.Select(city => city.Name)];

    public async Task<MeResponse> CreateAsync(BecomeMasterRequest request, CancellationToken cancellationToken)
    {
        var category = catalog.FindCategory(request.CategoryId ?? string.Empty)
            ?? throw FieldError(CategoryField, "Выберите направление");
        var city = cities.Value.Items.FirstOrDefault(item => item.Name == request.City)
            ?? throw FieldError(CityField, "Выберите город");
        var address = request.Address?.Trim() is { Length: > 0 } trimmed ? trimmed : throw FieldError(AddressField, "Укажите адрес");
        var userId = currentUser.UserId;

        if (await onboarding.MasterExistsForUserAsync(userId, cancellationToken))
        {
            throw MastersErrors.MasterExists();
        }

        var account = await accounts.ProfileAsync(userId, cancellationToken) ?? throw MastersErrors.MasterExists();
        var settings = defaults.Value;
        var masterId = Guid.CreateVersion7();

        await unitOfWork.InTransactionAsync(
            async token =>
            {
                onboarding.Add(
                    new Master
                    {
                        Id = masterId,
                        UserId = userId,
                        Name = account.Name,
                        PhotoUrl = account.PhotoUrl,
                        Specialty = category.Specialty,
                        CategoryIds = [category.Id],
                        City = city.Name,
                        Address = address,
                        Lat = city.Latitude,
                        Lng = city.Longitude,
                        VerificationStatus = VerificationStatus.None,
                        ShowOnline = true,
                        Phone = account.Phone,
                        Email = account.Email,
                        Telegram = account.Telegram,
                        Viber = account.Viber,
                        LocationSet = false
                    },
                    new Schedule
                    {
                        MasterId = masterId,
                        WorkDays = [.. settings.WorkDays],
                        TimeFrom = settings.TimeFrom,
                        TimeTo = settings.TimeTo,
                        SlotMinutes = settings.SlotMinutes,
                        Capacity = settings.Capacity,
                        AutoConfirmEnabled = settings.AutoConfirmEnabled,
                        AutoConfirmAfterMinutes = settings.AutoConfirmAfterMinutes
                    });

                if (!await onboarding.SaveAsync(token))
                {
                    throw MastersErrors.MasterExists();
                }

                await links.SetMasterAsync(userId, masterId, token);
            },
            cancellationToken);

        return await sessions.MeAsync(cancellationToken);
    }

    private static InvalidRequestException FieldError(string field, string message) =>
        new(ErrorCodes.InvalidRequest, message, new Dictionary<string, string[]> { [field] = [message] });
}
