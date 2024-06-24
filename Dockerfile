FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
WORKDIR /app

# copy csproj and restore as distinct layers
COPY *.sln .
COPY src/Api/*.csproj ./src/Api/
COPY src/Application/*.csproj ./src/Application/
COPY src/Domain/*.csproj ./src/Domain/
COPY src/Tests/*.csproj ./src/Tests/
RUN dotnet restore

# copy everything else and build app
COPY src/Api ./src/Api
COPY src/Application ./src/Application
COPY src/Domain ./src/Domain
RUN dotnet publish -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build-env /app/out .
ENTRYPOINT ["dotnet", "BookManager.Api.dll"]
