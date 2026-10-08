FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY .editorconfig global.json nuget.config Directory.Build.props Directory.Packages.props Nails.slnx ./
COPY Nails.Api/Nails.Api.csproj Nails.Api/packages.lock.json Nails.Api/
COPY Nails.Application/Nails.Application.csproj Nails.Application/packages.lock.json Nails.Application/
COPY Nails.Infrastructure/Nails.Infrastructure.csproj Nails.Infrastructure/packages.lock.json Nails.Infrastructure/
RUN dotnet restore Nails.Api/Nails.Api.csproj --locked-mode
COPY Nails.Api/ Nails.Api/
COPY Nails.Application/ Nails.Application/
COPY Nails.Infrastructure/ Nails.Infrastructure/
RUN dotnet publish Nails.Api/Nails.Api.csproj -c Release -o /app --no-restore -p:OpenApiGenerateDocuments=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT=Docker
COPY --from=build /app ./
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "Nails.Api.dll"]
