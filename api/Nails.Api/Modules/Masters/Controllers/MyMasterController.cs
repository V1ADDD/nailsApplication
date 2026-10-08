using Microsoft.AspNetCore.Mvc;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Requests;
using Nails.Application.Modules.Masters.Responses;

namespace Nails.Api.Modules.Masters.Controllers;

[ApiController]
[Route("me")]
public sealed class MyMasterController(IMyMasterService master) : ControllerBase
{
    [HttpGet]
    public Task<MasterResponse> Get(CancellationToken cancellationToken) => master.GetAsync(cancellationToken);

    [HttpPost]
    public Task<MasterResponse> Create(MasterProfileRequest request, CancellationToken cancellationToken) =>
        master.CreateAsync(request, cancellationToken);

    [HttpPut]
    public Task<MasterResponse> Update(UpdateMasterProfileRequest request, CancellationToken cancellationToken) =>
        master.UpdateAsync(request, cancellationToken);
}
