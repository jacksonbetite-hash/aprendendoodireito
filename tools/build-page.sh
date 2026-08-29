#!/bin/sh
# Monta uma página estática a partir dos fragmentos compartilhados.
# uso: tools/build-page.sh <arquivo-destino> <title> <description> <body-file> [body-class]
out="$1"; title="$2"; desc="$3"; body="$4"; bodyclass="${5:-}"
{
  echo '<!DOCTYPE html>'
  echo '<html lang="pt-BR">'
  echo '<head>'
  echo '<meta charset="UTF-8">'
  echo '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
  echo "<title>$title</title>"
  echo "<meta name=\"description\" content=\"$desc\">"
  echo '<link rel="preconnect" href="https://fonts.googleapis.com">'
  echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
  echo '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">'
  echo '<link rel="stylesheet" href="css/styles.css">'
  echo '</head>'
  if [ -n "$bodyclass" ]; then echo "<body class=\"$bodyclass\">"; else echo '<body>'; fi
  if [ "$bodyclass" != "app-body" ]; then cat "$(dirname "$0")"/partials/header.html; fi
  cat "$body"
  if [ "$bodyclass" != "app-body" ]; then cat "$(dirname "$0")"/partials/footer.html; fi
  echo '<script src="js/app.js"></script>'
  echo '</body>'
  echo '</html>'
} > "$out"
