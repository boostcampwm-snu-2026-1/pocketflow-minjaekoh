param(
    [switch]$Clear
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$tokenEnvName = "GITHUB_PAT_TOKEN"
$codexDir = Join-Path $env:USERPROFILE ".codex"
$configPath = Join-Path $codexDir "config.toml"
$githubMcpSection = @"
[mcp_servers.github]
url = "https://api.githubcopilot.com/mcp/"
bearer_token_env_var = "GITHUB_PAT_TOKEN"
"@

function Set-GitHubMcpConfig {
    if (-not (Test-Path $codexDir)) {
        New-Item -ItemType Directory -Path $codexDir -Force | Out-Null
    }

    $newSection = $githubMcpSection.TrimEnd() + [Environment]::NewLine

    if (-not (Test-Path $configPath)) {
        Set-Content -Path $configPath -Value $newSection -Encoding UTF8
        return
    }

    $config = Get-Content -Path $configPath -Raw
    $sectionPattern = '(?ms)^\[mcp_servers\.github\]\s*.*?(?=^\[|\z)'

    if ([regex]::IsMatch($config, $sectionPattern)) {
        $updated = [regex]::Replace($config, $sectionPattern, $newSection)
    }
    else {
        $trimmed = $config.TrimEnd()
        $updated = if ($trimmed.Length -gt 0) {
            $trimmed + [Environment]::NewLine + [Environment]::NewLine + $newSection
        }
        else {
            $newSection
        }
    }

    Set-Content -Path $configPath -Value $updated -Encoding UTF8
}

function Read-Token {
    $secureToken = Read-Host "Paste GitHub token" -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)

    try {
        $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    }
    finally {
        if ($bstr -ne [IntPtr]::Zero) {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        }
    }

    $token = $token.Trim()

    if ([string]::IsNullOrWhiteSpace($token)) {
        throw "Token was empty."
    }

    if ($token -match '\s') {
        throw "Token contains whitespace. Paste only the token value."
    }

    if ($token.Length -lt 20) {
        throw "Token looks too short. Check that the full token was pasted."
    }

    return $token
}

if ($Clear) {
    [Environment]::SetEnvironmentVariable($tokenEnvName, $null, "User")
    Remove-Item Env:\GITHUB_PAT_TOKEN -ErrorAction SilentlyContinue
    Write-Host "Removed $tokenEnvName from the user environment."
    exit 0
}

Set-GitHubMcpConfig
$token = Read-Token

[Environment]::SetEnvironmentVariable($tokenEnvName, $token, "User")
$env:GITHUB_PAT_TOKEN = $token

Write-Host ""
Write-Host "GitHub MCP token saved to user environment variable $tokenEnvName."
Write-Host "Codex must be restarted before the GitHub MCP tools appear in a new session."
Write-Host "Config: $configPath"
