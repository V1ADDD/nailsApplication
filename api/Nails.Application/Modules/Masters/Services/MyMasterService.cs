using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Nails.Application.Common.Exceptions;
using Nails.Application.Modules.Catalog.Contracts;
using Nails.Application.Modules.Identity.Contracts;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Options;
using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;
using Nails.Application.Modules.Masters.Rules;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Entities;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Application.Modules.Masters.Services;

public sealed class MyMasterService(
    IMasterRepository masters,
    IOfferRepository offers,
    ICatalogService catalog,
    IUnitOfWork unitOfWork,
    ICurrentUser currentUser,
    IOptions<MastersOptions> options) : IMyMasterService
{
    private const string PhoneField = "phone";
    private const string CityField = "cityId";
    private const string ServiceField = "serviceId";
    private const string PriceField = "price";

    public async Task<MasterResponse> GetAsync(CancellationToken cancellationToken)
    {
        var profile = await masters.FindByUserAsync(currentUser.UserId, cancellationToken) ?? throw ProfileMissing();
        return await ResponseAsync(profile, cancellationToken);
    }

    public async Task<MasterResponse> CreateAsync(MasterProfileRequest request, CancellationToken cancellationToken)
    {
        if (await masters.FindIdByUserAsync(currentUser.UserId, cancellationToken) is not null)
        {
            throw new ConflictException(ErrorCodes.MasterProfileExists, "Профиль мастера уже создан.");
        }

        var profile = new MasterProfile { Id = Guid.CreateVersion7(), UserId = currentUser.UserId };
        await ApplyAsync(profile, request, cancellationToken);

        masters.Add(profile);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return await ResponseAsync(profile, cancellationToken);
    }

    public async Task<MasterResponse> UpdateAsync(UpdateMasterProfileRequest request, CancellationToken cancellationToken)
    {
        var profile = await masters.FindByUserAsync(currentUser.UserId, cancellationToken) ?? throw ProfileMissing();

        if (profile.Version != request.Version)
        {
            throw ProfileChanged();
        }

        await ApplyAsync(profile, request, cancellationToken);

        try
        {
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw ProfileChanged();
        }

        return await ResponseAsync(profile, cancellationToken);
    }

    public async Task<OfferResponse> AddOfferAsync(OfferRequest request, CancellationToken cancellationToken)
    {
        var masterId = await RequireMasterAsync(cancellationToken);
        var maxOffers = options.Value.MaxOffers;

        if (await offers.CountAsync(masterId, cancellationToken) >= maxOffers)
        {
            throw InvalidRequestException.ForField(ServiceField, $"В прайсе может быть не больше {maxOffers} услуг.");
        }

        var offer = new Offer { Id = Guid.CreateVersion7(), MasterId = masterId };
        var directory = await ApplyAsync(offer, request, cancellationToken);

        offers.Add(offer);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return MasterResponses.Offer(offer, directory);
    }

    public async Task<OfferResponse> UpdateOfferAsync(Guid id, OfferRequest request, CancellationToken cancellationToken)
    {
        var masterId = await RequireMasterAsync(cancellationToken);
        var offer = await offers.FindAsync(masterId, id, cancellationToken) ?? throw OfferMissing();
        var directory = await ApplyAsync(offer, request, cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return MasterResponses.Offer(offer, directory);
    }

    public async Task DeleteOfferAsync(Guid id, CancellationToken cancellationToken)
    {
        var masterId = await RequireMasterAsync(cancellationToken);

        if (await offers.DeleteAsync(masterId, id, cancellationToken) == 0)
        {
            throw OfferMissing();
        }
    }

    private async Task ApplyAsync(MasterProfile profile, MasterProfileRequest request, CancellationToken cancellationToken)
    {
        var directory = await catalog.GetDirectoryAsync(cancellationToken);
        var city = directory.FindCity(request.CityId) ?? throw InvalidRequestException.ForField(CityField, "Выберите город из списка.");
        var phone = BelarusPhone.Normalize(request.Phone)
            ?? throw InvalidRequestException.ForField(PhoneField, "Укажите белорусский номер, например +375 (29) 123-45-67.");

        profile.DisplayName = request.DisplayName.Trim();
        profile.About = request.About.Trim();
        profile.Phone = phone;
        profile.CityId = city.Id;
        profile.Address = request.Address.Trim();
    }

    private async Task<CatalogDirectory> ApplyAsync(Offer offer, OfferRequest request, CancellationToken cancellationToken)
    {
        var directory = await catalog.GetDirectoryAsync(cancellationToken);
        var service = directory.FindService(request.ServiceId)
            ?? throw InvalidRequestException.ForField(ServiceField, "Выберите услугу из каталога.");
        var price = OfferPrice.Normalize(request.PriceKind, request.Price)
            ?? throw InvalidRequestException.ForField(PriceField, "Укажите цену больше нуля, не больше двух знаков после запятой.");

        if (await offers.ExistsAsync(offer.MasterId, service.Id, offer.Id, cancellationToken))
        {
            throw new ConflictException(ErrorCodes.OfferExists, "Эта услуга уже есть в вашем прайсе.");
        }

        offer.ServiceId = service.Id;
        offer.CategoryId = service.CategoryId;
        offer.PriceKind = request.PriceKind;
        offer.Price = price;
        offer.DurationMinutes = request.DurationMinutes;

        return directory;
    }

    private async Task<Guid> RequireMasterAsync(CancellationToken cancellationToken) =>
        await masters.FindIdByUserAsync(currentUser.UserId, cancellationToken)
            ?? throw new ForbiddenException(ErrorCodes.MasterProfileRequired, "Сначала создайте профиль мастера.");

    private async Task<MasterResponse> ResponseAsync(MasterProfile profile, CancellationToken cancellationToken)
    {
        var directory = await catalog.GetDirectoryAsync(cancellationToken);
        return MasterResponses.Master(profile, await offers.ListAsync([profile.Id], cancellationToken), directory);
    }

    private static NotFoundException ProfileMissing() =>
        new(ErrorCodes.MasterProfileMissing, "У вас пока нет профиля мастера.");

    private static NotFoundException OfferMissing() => new("Такой услуги нет в вашем прайсе.");

    private static ConflictException ProfileChanged() =>
        new("Профиль изменился в другой вкладке. Обновите страницу и попробуйте снова.");
}
