using Serilog;
using Starter.Api.Host.Extensions;
using Starter.Api.Host.Middleware;
using Starter.Application.Common;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseWindowsService();
builder.Services.AddSerilog((_, logger) => logger.ReadFrom.Configuration(builder.Configuration));

var modules = builder.Services.AddStarterApplication(builder.Configuration);
builder.Services.AddStarterControllers(modules);
builder.Services.AddStarterSecurity(builder.Configuration);
builder.Services.AddStarterRateLimiting();
builder.Services.AddStarterOpenApi(builder.Configuration);
builder.Services.AddStarterHealthChecks();

var app = builder.Build();

await app.Services.PrepareApplicationAsync(app.Lifetime.ApplicationStopping);

app.UseStarterSecurity();
app.UseSerilogRequestLogging();
app.UseMiddleware<ExceptionMiddleware>();
app.UseStatusCodePages();
app.UseRouting();
app.UseRateLimiter();
app.UseAuthentication();
app.UseMiddleware<TenantMiddleware>();
app.UseMiddleware<AntiforgeryMiddleware>();
app.UseAuthorization();
app.UseStarterOpenApi();
app.MapControllers();
app.MapStarterModules();
app.MapStarterHealthChecks();

await app.RunAsync();
