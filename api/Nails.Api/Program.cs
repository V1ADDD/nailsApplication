using Serilog;
using Nails.Api.Host.Extensions;
using Nails.Api.Host.Middleware;
using Nails.Application.Common;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseWindowsService();
builder.Services.AddSerilog((_, logger) => logger.ReadFrom.Configuration(builder.Configuration));

var modules = builder.Services.AddNailsApplication(builder.Configuration);
builder.Services.AddNailsControllers(modules);
builder.Services.AddNailsSecurity(builder.Configuration);
builder.Services.AddNailsRateLimiting();
builder.Services.AddNailsOpenApi(builder.Configuration);
builder.Services.AddNailsHealthChecks();

var app = builder.Build();

await app.Services.PrepareApplicationAsync(app.Lifetime.ApplicationStopping);

app.UseNailsSecurity();
app.UseSerilogRequestLogging();
app.UseMiddleware<ExceptionMiddleware>();
app.UseStatusCodePages();
app.UseRouting();
app.UseRateLimiter();
app.UseAuthentication();
app.UseMiddleware<TenantMiddleware>();
app.UseMiddleware<AntiforgeryMiddleware>();
app.UseAuthorization();
app.UseNailsOpenApi();
app.MapControllers();
app.MapNailsModules();
app.MapNailsHealthChecks();

await app.RunAsync();
