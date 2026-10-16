using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nails.Application.Common.Modules;
using Nails.Application.Common.Realtime;
using Nails.Application.Modules.Masters.Contracts;
using Nails.Application.Modules.Masters.Options;
using Nails.Application.Modules.Masters.Responses;
using Nails.Application.Modules.Masters.Services;
using Nails.Application.Modules.Masters.Seed;
using Nails.Infrastructure.Common;
using Nails.Infrastructure.Modules.Masters.Contracts;
using Nails.Infrastructure.Modules.Masters.Repositories;
using Nails.Infrastructure.Persistence.Contracts;

namespace Nails.Application.Modules.Masters;

public sealed class MastersModule : IAppModule
{
    public string Name => "Masters";

    public bool AlwaysOn => false;

    public IReadOnlyList<string> DependsOn => [];

    public void Register(IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatedOptions<MasterSearchOptions>(configuration, MasterSearchOptions.SectionName);
        services.AddValidatedOptions<BookingOptions>(configuration, BookingOptions.SectionName);
        services.AddValidatedOptions<ReviewOptions>(configuration, ReviewOptions.SectionName);
        services.AddValidatedOptions<BookingTimeRulesOptions>(configuration, BookingTimeRulesOptions.SectionName);
        services.AddValidatedOptions<MyBookingsOptions>(configuration, MyBookingsOptions.SectionName);
        services.AddValidatedOptions<FavoritesOptions>(configuration, FavoritesOptions.SectionName);
        services.AddValidatedOptions<CitiesOptions>(configuration, CitiesOptions.SectionName);
        services.AddValidatedOptions<NewMasterOptions>(configuration, NewMasterOptions.SectionName);
        services.AddScoped<IMasterSearchRepository, MasterSearchRepository>();
        services.AddScoped<IFavoriteRepository, FavoriteRepository>();
        services.AddScoped<MasterFacts>();
        services.AddScoped<IBookingEvents, BookingEvents>();
        services.AddScoped<IMasterSearchService, MasterSearchService>();
        services.AddScoped<IMasterProfileRepository, MasterProfileRepository>();
        services.AddScoped<IMasterProfileService, MasterProfileService>();
        services.AddScoped<IBookingRepository, BookingRepository>();
        services.AddScoped<BookingChanges>();
        services.AddScoped<BookingResponses>();
        services.AddScoped<IBookingMoveRepository, BookingMoveRepository>();
        services.AddScoped<IBookingMoveService, BookingMoveService>();
        services.AddScoped<IMyBookingRepository, MyBookingRepository>();
        services.AddScoped<IMyBookingService, MyBookingService>();
        services.AddScoped<IReviewRepository, ReviewRepository>();
        services.AddScoped<IMyReviewService, MyReviewService>();
        services.AddScoped<IOnboardingRepository, OnboardingRepository>();
        services.AddScoped<IMasterOnboardingService, MasterOnboardingService>();
        services.AddScoped<IBookingService, BookingService>();
        services.AddScoped<IBookingTimeRules, BookingTimeRules>();
        services.AddHostedService<BookingTimeRulesJob>();
        services.AddScoped<IFavoriteService, FavoriteService>();
        services.AddScoped<IMasterDirectoryRepository, MasterDirectoryRepository>();
        services.AddScoped<IMasterDirectory, MasterDirectory>();
        services.AddScoped<IDemoSeeder, MastersDemoSeeder>();
        services.AddRealtimeEvent<BookingChangedEvent>();
    }
}
