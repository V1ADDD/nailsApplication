using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Starter.Application.Common.Modules;
using Starter.Application.Modules.Notes.Contracts;
using Starter.Application.Modules.Notes.Options;
using Starter.Application.Modules.Notes.Services;
using Starter.Infrastructure.Common;
using Starter.Infrastructure.Modules.Notes.Contracts;
using Starter.Infrastructure.Modules.Notes.Repositories;

namespace Starter.Application.Modules.Notes;

public sealed class NotesModule : IAppModule
{
    public string Name => "Notes";

    public bool AlwaysOn => false;

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatedOptions<NotesOptions>(configuration, NotesOptions.SectionName);
        services.AddScoped<INoteRepository, NoteRepository>();
        services.AddScoped<INoteService, NoteService>();
    }
}
