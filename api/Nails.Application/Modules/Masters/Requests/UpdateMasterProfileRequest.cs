namespace Nails.Application.Modules.Masters.Requests;

public sealed class UpdateMasterProfileRequest : MasterProfileRequest
{
    public required long Version { get; init; }
}
