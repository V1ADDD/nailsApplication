[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[A-Z][A-Za-z0-9]*$')]
    [string]$Name,

    [string]$OwnerEmail = 'owner@example.com',

    [switch]$WithoutExample,

    [switch]$SkipInstall
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$root = $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding $false
$kebab = ([regex]::Replace($Name, '(?<=[a-z0-9])([A-Z])', '-$1')).ToLowerInvariant()

function Read-Text([string]$path) {
    [System.IO.File]::ReadAllText((Join-Path $root $path))
}

function Write-Text([string]$path, [string]$text) {
    [System.IO.File]::WriteAllText((Join-Path $root $path), $text, $utf8)
}

function Edit-Text([string]$path, [scriptblock]$change) {
    $before = Read-Text $path
    $after = & $change $before
    if ($after -eq $before) {
        throw "Nothing to change in $path."
    }
    Write-Text $path $after
}

function Remove-Line([string]$path, [string]$pattern) {
    Edit-Text $path { param($text) [regex]::Replace($text, "(?m)^.*$([regex]::Escape($pattern)).*\r?\n", '') }
}

function New-Secret([int]$bytes) {
    $buffer = New-Object byte[] $bytes
    $generator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $generator.GetBytes($buffer)
    $generator.Dispose()
    [Convert]::ToBase64String($buffer).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

function Invoke-Checked([string]$what, [scriptblock]$command) {
    Write-Host "  $what"
    $previous = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $output = & $command 2>&1 | ForEach-Object { "$_" }
    }
    finally {
        $ErrorActionPreference = $previous
    }
    if ($LASTEXITCODE -ne 0) {
        $output | Out-Host
        throw "$what failed with exit code $LASTEXITCODE."
    }
}

if (-not (Read-Text 'README.md').Contains('## Use this template')) {
    throw 'This folder was already initialized.'
}

Write-Host "Initializing $Name"

if ($WithoutExample) {
    Write-Host 'Removing the Notes example module'
    foreach ($path in @(
            'api/Starter.Infrastructure/Modules/Notes',
            'api/Starter.Application/Modules/Notes',
            'api/Starter.Api/Modules/Notes',
            'api/Starter.Api/Modules/Help/Content/en/articles/notes.json',
            'api/Starter.Infrastructure/Persistence/Migrations',
            'client/libs/shared/notes',
            'client/libs/web/notes')) {
        Remove-Item (Join-Path $root $path) -Recurse -Force
    }
    Remove-Line 'api/Starter.Application/Common/Modules/ModuleCatalog.cs' 'Notes'
    Edit-Text 'api/Starter.Application/Common/Modules/ModuleCatalog.cs' { param($text) $text.Replace('new HelpModule(),', 'new HelpModule()') }
    Remove-Line 'api/Starter.Infrastructure/Persistence/DatabaseSchemas.cs' 'Notes'
    foreach ($settings in @('Development', 'Docker', 'Production')) {
        Edit-Text "api/Starter.Api/appsettings.$settings.json" { param($text) [regex]::Replace($text, ',\r?\n\s*"Notes": \{[^}]*\}', '') }
    }
    Remove-Line 'client/apps/web/src/modules.ts' "'notes'"
    Remove-Line 'client/tsconfig.base.json' '@starter/shared/notes/'
    Remove-Line 'client/tsconfig.base.json' '@starter/web/notes/'
    Edit-Text 'client/tsconfig.base.json' { param($text) $text.Replace('"./libs/web/help/feature/src/index.ts"],', '"./libs/web/help/feature/src/index.ts"]') }
    Edit-Text 'README.md' {
        param($text)
        [regex]::Replace($text, '(?m)^\| `Notes` .*\r?\n', '').Replace('1. Copy the shape of `Notes` in each folder above.', '1. Create the folders above for the new module.')
    }
    Edit-Text '.specify/memory/constitution.md' { param($text) $text.Replace('; `Notes` shows the shape of a module', '') }
}

Write-Host "Renaming Starter to $Name"
$excluded = '[\\/](\.git|node_modules|bin|obj|dist|\.nx|\.angular|tmp)([\\/]|$)'
$textExtensions = @('.cs', '.csproj', '.props', '.slnx', '.json', '.md', '.yml', '.yaml', '.ts', '.mjs', '.html', '.scss', '.svg', '.template', '.example')
$textNames = @('Dockerfile', '.gitignore', '.dockerignore', '.editorconfig', '.gitattributes', '.prettierrc', '.prettierignore')
$files = Get-ChildItem $root -Recurse -File -Force | Where-Object {
    $_.FullName -notmatch $excluded -and $_.FullName -ne $PSCommandPath -and ($textExtensions -contains $_.Extension -or $textNames -contains $_.Name)
}
foreach ($file in $files) {
    $before = [System.IO.File]::ReadAllText($file.FullName)
    $after = $before.Replace('Starter', $Name).Replace('starter', $kebab)
    if ($after -ne $before) {
        [System.IO.File]::WriteAllText($file.FullName, $after, $utf8)
    }
}
Get-ChildItem $root -Recurse -Force | Where-Object { $_.Name -cmatch 'Starter|starter' -and $_.FullName -notmatch $excluded } |
    Sort-Object { $_.FullName.Length } -Descending |
    ForEach-Object { Rename-Item $_.FullName ($_.Name.Replace('Starter', $Name).Replace('starter', $kebab)) }

Edit-Text 'README.md' { param($text) [regex]::Replace($text, '(?s)## Use this template.*?(?=## )', '') }

Write-Host 'Writing local secrets'
$databasePassword = New-Secret 24
$ownerPassword = New-Secret 18
Write-Text '.env' (@(
        "POSTGRES_PASSWORD=$databasePassword",
        'POSTGRES_PORT=5432',
        "OWNER_EMAIL=$OwnerEmail",
        "OWNER_PASSWORD=$ownerPassword",
        'WEB_PORT=8080'
    ) -join "`n")

if (-not $SkipInstall) {
    Push-Location (Join-Path $root 'api')
    try {
        Invoke-Checked 'dotnet tool restore' { dotnet tool restore }
        Invoke-Checked 'dotnet restore' { dotnet restore "$Name.slnx" }
        $secrets = [ordered]@{
            'ConnectionStrings:Database'               = "Host=localhost;Port=5432;Database=$kebab;Username=$kebab;Password=$databasePassword"
            'Modules:Identity:Bootstrap:OwnerEmail'    = $OwnerEmail
            'Modules:Identity:Bootstrap:OwnerPassword' = $ownerPassword
        }
        foreach ($key in $secrets.Keys) {
            Invoke-Checked "user secret $key" { dotnet user-secrets set $key $secrets[$key] --project "$Name.Api" }
        }
        $migrations = Join-Path $root "api/$Name.Infrastructure/Persistence/Migrations"
        if (Test-Path $migrations) {
            Remove-Item $migrations -Recurse -Force
        }
        Invoke-Checked 'dotnet ef migrations add Initial' {
            dotnet ef migrations add Initial --project "$Name.Infrastructure" --startup-project "$Name.Api" --output-dir Persistence/Migrations
        }
        Invoke-Checked 'dotnet build' { dotnet build "$Name.slnx" --no-restore }
    }
    finally {
        Pop-Location
    }

    Push-Location (Join-Path $root 'client')
    try {
        Invoke-Checked 'npm ci' { npm ci --no-audit --no-fund }
        Invoke-Checked 'API types' { npx nx run shared-core-data-access:api-types --skip-nx-cache }
        Invoke-Checked 'prettier' { npx prettier --write . --log-level warn }
    }
    finally {
        Pop-Location
    }
}

Remove-Item $PSCommandPath

Write-Host ''
Write-Host "$Name is ready. Owner: $OwnerEmail / $ownerPassword (in .env and the API user secrets)."
Write-Host '  docker compose up -d'
Write-Host "  cd api; dotnet run --project $Name.Api"
Write-Host '  cd client; npx nx run web:serve'
