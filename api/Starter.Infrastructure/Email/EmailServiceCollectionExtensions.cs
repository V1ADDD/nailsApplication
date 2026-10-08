using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Starter.Infrastructure.Common;
using Starter.Infrastructure.Email.Contracts;
using Starter.Infrastructure.Options;

namespace Starter.Infrastructure.Email;

public static class EmailServiceCollectionExtensions
{
    public static IServiceCollection AddEmail(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatedOptions<EmailOptions>(configuration, EmailOptions.SectionName);
        services.AddScoped<IEmailSender, SmtpEmailSender>();

        return services;
    }
}
