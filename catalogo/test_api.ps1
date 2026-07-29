$body = @{
    model = "openrouter/free"
    messages = @(
        @{ role = "user"; content = "Hola, que eres?" }
    )
} | ConvertTo-Json -Depth 5

$headers = @{
    "Authorization" = "Bearer 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"
}

$response = Invoke-RestMethod -Uri "https://openrouter.ai/api/v1/chat/completions" -Method Post -ContentType "application/json" -Headers $headers -Body $body
Write-Host "RESPUESTA EXITOSA:"
Write-Host $response.choices[0].message.content
