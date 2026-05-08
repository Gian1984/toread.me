<?php
declare(strict_types=1);

@set_time_limit(60);
@ini_set('zlib.output_compression', '0');

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=600');
header('X-Accel-Buffering: no');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['detail' => 'Method not allowed']);
    exit;
}

$base = 'https://gutendex.com/books/';
$allowedParams = ['search', 'topic', 'languages', 'sort', 'page'];
$cacheTtl = 600;

if (isset($_GET['id'])) {
    $id = (string) $_GET['id'];
    if (!preg_match('/^\d+$/', $id)) {
        http_response_code(400);
        echo json_encode(['detail' => 'Invalid book id']);
        exit;
    }
    $target = $base . $id;
    $cacheKey = 'id-' . $id;
} else {
    $query = [];
    foreach ($allowedParams as $param) {
        if (isset($_GET[$param]) && $_GET[$param] !== '') {
            $query[$param] = (string) $_GET[$param];
        }
    }
    ksort($query);
    $target = $base . ($query ? ('?' . http_build_query($query)) : '');
    $cacheKey = 'list-' . md5($target);
}

$cached = cache_read($cacheKey, $cacheTtl);
if ($cached !== null) {
    header('X-Cache: HIT');
    http_response_code(200);
    echo $cached;
    exit;
}

$response = fetch_url($target, 'application/json');
if ($response['status'] < 200 || $response['status'] >= 400 || $response['body'] === '') {
    $stale = cache_read($cacheKey, 0);
    if ($stale !== null) {
        header('X-Cache: STALE');
        http_response_code(200);
        echo $stale;
        exit;
    }
    http_response_code(502);
    echo json_encode([
        'detail' => 'Gutendex request failed',
        'upstream_status' => $response['status'],
    ]);
    exit;
}

cache_write($cacheKey, $response['body']);
header('X-Cache: MISS');
http_response_code($response['status']);
echo $response['body'];

function cache_dir(): ?string
{
    $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'toread-gutendex-cache';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        return null;
    }
    return is_writable($dir) ? $dir : null;
}

function cache_read(string $key, int $maxAge): ?string
{
    $dir = cache_dir();
    if ($dir === null) return null;
    $path = $dir . DIRECTORY_SEPARATOR . $key . '.json';
    if (!is_file($path)) return null;
    if ($maxAge > 0) {
        $mtime = @filemtime($path);
        if ($mtime === false || (time() - $mtime) > $maxAge) return null;
    }
    $body = @file_get_contents($path);
    return is_string($body) ? $body : null;
}

function cache_write(string $key, string $body): void
{
    $dir = cache_dir();
    if ($dir === null) return;
    $path = $dir . DIRECTORY_SEPARATOR . $key . '.json';
    $tmp = $path . '.tmp.' . bin2hex(random_bytes(4));
    if (@file_put_contents($tmp, $body) === false) return;
    @rename($tmp, $path);
}

function fetch_url(string $url, string $accept): array
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 45,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_HTTPHEADER => ['Accept: ' . $accept],
            CURLOPT_USERAGENT => 'toread.me/1.0',
        ]);
        $body = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);

        return [
            'status' => $status,
            'body' => is_string($body) ? $body : '',
        ];
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "Accept: {$accept}\r\nUser-Agent: toread.me/1.0\r\n",
            'timeout' => 45,
            'ignore_errors' => true,
        ],
    ]);
    $body = @file_get_contents($url, false, $context);
    $status = 0;
    $headers = $http_response_header ?? [];

    if (isset($headers[0]) && preg_match('/\s(\d{3})\s/', $headers[0], $matches)) {
        $status = (int) $matches[1];
    }

    return [
        'status' => $status ?: 502,
        'body' => is_string($body) ? $body : '',
    ];
}
