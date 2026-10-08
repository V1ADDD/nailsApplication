FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY .editorconfig global.json nuget.config Directory.Build.props Directory.Packages.props Starter.slnx ./
COPY Starter.Api/Starter.Api.csproj Starter.Api/packages.lock.json Starter.Api/
COPY Starter.Application/Starter.Application.csproj Starter.Application/packages.lock.json Starter.Application/
COPY Starter.Infrastructure/Starter.Infrastructure.csproj Starter.Infrastructure/packages.lock.json Starter.Infrastructure/
RUN dotnet restore Starter.Api/Starter.Api.csproj --locked-mode
COPY Starter.Api/ Starter.Api/
COPY Starter.Application/ Starter.Application/
COPY Starter.Infrastructure/ Starter.Infrastructure/
RUN dotnet publish Starter.Api/Starter.Api.csproj -c Release -o /app --no-restore -p:OpenApiGenerateDocuments=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT=Docker
COPY --from=build /app ./
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "Starter.Api.dll"]
