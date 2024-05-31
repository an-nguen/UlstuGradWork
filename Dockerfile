FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /App

# Project directories
COPY ./src/Api ./src/Api
COPY ./src/Application ./src/Application
COPY ./src/Domain ./src/Domain
COPY ./src/Tests ./src/Tests
COPY ./BLibMgr.sln ./BLibMgr.sln
# Restore as distinct layers
RUN dotnet restore
# Build and publish a release
RUN dotnet publish -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /App
COPY --from=build-env /App/out .
ENTRYPOINT ["dotnet", "BookManager.Api.dll"]