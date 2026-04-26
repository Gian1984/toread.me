<?php
declare(strict_types=1);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Method not allowed';
    exit;
}

$url = isset($_GET['url']) ? (string) $_GET['url'] : '';
$parts = parse_url($url);
$host = strtolower((string) ($parts['host'] ?? ''));
$scheme = strtolower((string) ($parts['scheme'] ?? ''));

if ($url === '' || $scheme !== 'https' || !is_allowed_host($host)) {
    http_response_code(400);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Invalid EPUB source';
    exit;
}

header('Content-Type: application/epub+zip');
header('Content-Disposition: inline; filename="book.epub"');
header('Cache-Control: public, max-age=86400');

$ok = stream_epub($url);
if (!$ok) {
    http_response_code(502);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Unable to fetch EPUB';
}

function is_allowed_host(string $host): bool
{
    return $host === 'gutenberg.org'
        || str_ends_with($host, '.gutenberg.org')
        || $host === 'gutenberg.pglaf.org'
        || str_ends_with($host, '.gutenberg.pglaf.org');
}

function stream_epub(string $url): bool
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => 8,
            CURLOPT_TIMEOUT => 60,
            CURLOPT_HTTPHEADER => ['Accept: application/epub+zip,application/octet-stream,*/*'],
            CURLOPT_USERAGENT => 'toread.me/1.0',
            CURLOPT_WRITEFUNCTION => static function ($ch, string $chunk): int {
                echo $chunk;
                return strlen($chunk);
            },
        ]);
        $result = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);

        return $result !== false && $status >= 200 && $status < 400;
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "Accept: application/epub+zip,application/octet-stream,*/*\r\nUser-Agent: toread.me/1.0\r\n",
            'timeout' => 60,
            'ignore_errors' => true,
        ],
    ]);
    $handle = fopen($url, 'rb', false, $context);
    if (!$handle) return false;

    while (!feof($handle)) {
        echo fread($handle, 8192);
    }
    fclose($handle);

    return true;
}
