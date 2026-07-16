Get-ChildItem -Recurse -File -Filter *.ts |
    Where-Object { $_.FullName -notmatch '\\(node_modules|dist|logs)\\' } |
    ForEach-Object {
        $relativePath = $_.FullName.Substring($basePath.Length + 1)
        "============================================================"
        "Archivo: $relativePath"
        "============================================================"
        Get-Content $_.FullName
        ""
    } | Out-File -FilePath "context.txt" -Encoding UTF8