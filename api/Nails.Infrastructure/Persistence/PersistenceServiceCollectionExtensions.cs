using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Nails.Infrastructure.Common;
using Nails.Infrastructure.Options;
using Nails.Infrastructure.Persistence.Contracts;
using Nails.Infrastructure.Persistence.Interceptors;

namespace Nails.Infrastructure.Persistence;

public static class PersistenceServiceCollectionExtensions
{
    public const string ConnectionName = "Database";

    private const string MigrationsHistoryTable = "ef_migrations_history";
    private const string DataProtectionApplicationName = "nails";

    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatedOptions<DatabaseOptions>(configuration, DatabaseOptions.SectionName);
        services.AddValidatedOptions<DemoOptions>(configuration, DemoOptions.SectionName);
        services.AddScoped<AuditingInterceptor>();
        services.AddScoped<TenantInterceptor>();

        services.AddDbContext<AppDbContext>((provider, options) => options
            .UseNpgsql(
                configuration.GetConnectionString(ConnectionName),
                npgsql => npgsql
                    .MigrationsHistoryTable(MigrationsHistoryTable, DatabaseSchemas.Platform)
                    .EnableRetryOnFailure(provider.GetRequiredService<IOptions<DatabaseOptions>>().Value.MaxRetryCount))
            .UseSnakeCaseNamingConvention()
            .AddInterceptors(
                provider.GetRequiredService<AuditingInterceptor>(),
                provider.GetRequiredService<TenantInterceptor>()));

        services.AddScoped<IUnitOfWork, UnitOfWork>();

        var dataProtection = services.AddDataProtection().SetApplicationName(DataProtectionApplicationName);

        if (!BuildContext.IsGeneratingOpenApiDocument)
        {
            dataProtection.PersistKeysToDbContext<AppDbContext>();
        }

        return services;
    }
}
