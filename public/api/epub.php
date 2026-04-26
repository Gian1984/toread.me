<?php
declare(strict_types=1);

set_time_limit(180);
ignore_user_abort(true);

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

$result = fetch_epub_to_temp($url);

if (!$result['ok'] || !is_file($result['file']) || filesize($result['file']) === 0) {
    if (is_file($result['file'])) {
        unlink($result['file']);
    }
    http_response_code($result['status'] ?: 504);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Unable to fetch EPUB before timeout';
    exit;
}

header('Content-Type: application/epub+zip');
header('Content-Disposition: inline; filename="book.epub"');
header('Content-Length: ' . filesize($result['file']));
header('Cache-Control: public, max-age=86400');
readfile($result['file']);
unlink($result['file']);

function is_allowed_host(string $host): bool
{
    return $host === 'gutenberg.org'
        || str_ends_with($host, '.gutenberg.org')
        || $host === 'gutenberg.pglaf.org'
        || str_ends_with($host, '.gutenberg.pglaf.org');
}

function fetch_epub_to_temp(string $url): array
{
    $tmp = tempnam(sys_get_temp_dir(), 'toread-epub-');
    if ($tmp === false) {
        return ['ok' => false, 'status' => 500, 'file' => ''];
    }

    if (function_exists('curl_init')) {
        $handle = fopen($tmp, 'wb');
        if (!$handle) {
            return ['ok' => false, 'status' => 500, 'file' => $tmp];
        }

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_FILE => $handle,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => 15,
            CURLOPT_TIMEOUT => 150,
            CURLOPT_LOW_SPEED_LIMIT => 1024,
            CURLOPT_LOW_SPEED_TIME => 30,
            CURLOPT_HTTPHEADER => ['Accept: application/epub+zip,application/octet-stream,*/*'],
            CURLOPT_USERAGENT => 'toread.me/1.0',
        ]);
        $result = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);
        fclose($handle);

        return [
            'ok' => $result !== false && $status >= 200 && $status < 400,
            'status' => $status ?: 504,
            'file' => $tmp,
        ];
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "Accept: application/epub+zip,application/octet-stream,*/*\r\nUser-Agent: toread.me/1.0\r\n",
            'timeout' => 150,
            'ignore_errors' => true,
        ],
    ]);
    $source = fopen($url, 'rb', false, $context);
    if (!$source) return ['ok' => false, 'status' => 504, 'file' => $tmp];

    $target = fopen($tmp, 'wb');
    if (!$target) {
        fclose($source);
        return ['ok' => false, 'status' => 500, 'file' => $tmp];
    }

    while (!feof($source)) {
        fwrite($target, fread($source, 8192));
    }
    fclose($source);
    fclose($target);

    return ['ok' => true, 'status' => 200, 'file' => $tmp];
}
