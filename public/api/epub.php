<?php
declare(strict_types=1);

@set_time_limit(300);
@ini_set('output_buffering', 'off');
@ini_set('zlib.output_compression', '0');
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

stream_epub($url);

function is_allowed_host(string $host): bool
{
    return $host === 'gutenberg.org'
        || str_ends_with($host, '.gutenberg.org')
        || $host === 'gutenberg.pglaf.org'
        || str_ends_with($host, '.gutenberg.pglaf.org');
}

function stream_epub(string $url): void
{
    while (ob_get_level() > 0) {
        ob_end_clean();
    }

    $headersSent = false;
    $upstreamStatus = 0;
    $contentLength = '';

    $sendHeadersOnce = static function () use (&$headersSent, &$upstreamStatus, &$contentLength) {
        if ($headersSent) return;
        $headersSent = true;

        if ($upstreamStatus < 200 || $upstreamStatus >= 400) {
            http_response_code($upstreamStatus >= 400 ? $upstreamStatus : 502);
            header('Content-Type: text/plain; charset=utf-8');
            echo 'Unable to fetch EPUB from upstream';
            return;
        }

        header('Content-Type: application/epub+zip');
        header('Content-Disposition: inline; filename="book.epub"');
        header('Cache-Control: public, max-age=86400');
        header('X-Accel-Buffering: no');
        if ($contentLength !== '') {
            header('Content-Length: ' . $contentLength);
        }
    };

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => 15,
            CURLOPT_TIMEOUT => 240,
            CURLOPT_LOW_SPEED_LIMIT => 1024,
            CURLOPT_LOW_SPEED_TIME => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_HTTPHEADER => ['Accept: application/epub+zip,application/octet-stream,*/*'],
            CURLOPT_USERAGENT => 'toread.me/1.0',
            CURLOPT_HEADERFUNCTION => static function ($ch, string $header) use (&$upstreamStatus, &$contentLength): int {
                if (preg_match('#^HTTP/\S+\s+(\d{3})#', $header, $m)) {
                    $upstreamStatus = (int) $m[1];
                    $contentLength = '';
                } elseif (stripos($header, 'Content-Length:') === 0 && $upstreamStatus >= 200 && $upstreamStatus < 300) {
                    $contentLength = trim(substr($header, strlen('Content-Length:')));
                }
                return strlen($header);
            },
            CURLOPT_WRITEFUNCTION => static function ($ch, string $chunk) use (&$sendHeadersOnce, &$upstreamStatus): int {
                $sendHeadersOnce();
                if ($upstreamStatus >= 200 && $upstreamStatus < 300) {
                    echo $chunk;
                    @ob_flush();
                    @flush();
                }
                return strlen($chunk);
            },
        ]);
        $ok = curl_exec($ch);
        $err = curl_errno($ch);
        curl_close($ch);

        if (!$headersSent) {
            if ($ok === false || $err !== 0) {
                http_response_code(504);
                header('Content-Type: text/plain; charset=utf-8');
                echo 'Unable to fetch EPUB before timeout';
            } else {
                $sendHeadersOnce();
            }
        }
        return;
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "Accept: application/epub+zip,application/octet-stream,*/*\r\nUser-Agent: toread.me/1.0\r\n",
            'timeout' => 240,
            'ignore_errors' => true,
        ],
    ]);
    $source = @fopen($url, 'rb', false, $context);
    if (!$source) {
        http_response_code(504);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Unable to fetch EPUB before timeout';
        return;
    }

    $headers = $http_response_header ?? [];
    if (isset($headers[0]) && preg_match('#\s(\d{3})\s#', $headers[0], $m)) {
        $upstreamStatus = (int) $m[1];
    }
    foreach ($headers as $h) {
        if (stripos($h, 'Content-Length:') === 0) {
            $contentLength = trim(substr($h, strlen('Content-Length:')));
            break;
        }
    }

    $sendHeadersOnce();
    if ($upstreamStatus >= 200 && $upstreamStatus < 300) {
        while (!feof($source)) {
            echo fread($source, 65536);
            @ob_flush();
            @flush();
        }
    }
    fclose($source);
}
