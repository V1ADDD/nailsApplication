using Nails.Application.Modules.Identity.Requests;
using Nails.Application.Modules.Identity.Responses;

namespace Nails.Application.Modules.Identity.Contracts;

public interface IAccountService
{
    Task<MeResponse> UpdateProfileAsync(UpdateProfileRequest request, CancellationToken cancellationToken);

    Task<NotificationSettingsResponse> SetNotificationsAsync(NotificationSettingsRequest request, CancellationToken cancellationToken);

    Task<PhoneCodeResponse> RequestPhoneCodeAsync(PhoneChangeCodeRequest request, CancellationToken cancellationToken);

    Task<MeResponse> ChangePhoneAsync(PhoneChangeRequest request, CancellationToken cancellationToken);

    Task SignOutOthersAsync(CancellationToken cancellationToken);
}
