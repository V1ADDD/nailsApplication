using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Nails.Infrastructure.Common;
using Nails.Infrastructure.Email.Contracts;
using Nails.Infrastructure.Options;

namespace Nails.Infrastructure.Email;

public static class EmailServiceCollectionExtensions
{
    public static IServiceCollection AddEmail(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidatedOptions<EmailOptions>(configuration, EmailOptions.SectionName);
        services.AddScoped<IEmailSender, SmtpEmailSender>();

        return services;
    }
}
