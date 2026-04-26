<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['detail' => 'Method not allowed']);
    exit;
}

$base = 'https://gutendex.com/books/';
$allowedParams = ['search', 'topic', 'languages', 'sort', 'page'];

if (isset($_GET['id'])) {
    $id = (string) $_GET['id'];
    if (!preg_match('/^\d+$/', $id)) {
        http_response_code(400);
        echo json_encode(['detail' => 'Invalid book id']);
        exit;
    }
    $target = $base . $id;
} else {
    $query = [];
    foreach ($allowedParams as $param) {
        if (isset($_GET[$param]) && $_GET[$param] !== '') {
            $query[$param] = (string) $_GET[$param];
        }
    }
    $target = $base . ($query ? ('?' . http_build_query($query)) : '');
}

$response = fetch_url($target, 'application/json');
if ($response['status'] >= 400 || $response['body'] === '') {
    http_response_code($response['status'] ?: 502);
    echo json_encode(['detail' => 'Gutendex request failed']);
    exit;
}

http_response_code($response['status']);
echo $response['body'];

function fetch_url(string $url, string $accept): array
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => 8,
            CURLOPT_TIMEOUT => 20,
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
            'timeout' => 20,
            'ignore_errors' => true,
        ],
    ]);
    $body = file_get_contents($url, false, $context);
    $status = 0;
    $headers = function_exists('http_get_last_response_headers')
        ? http_get_last_response_headers()
        : ($http_response_header ?? []);

    if (isset($headers[0]) && preg_match('/\s(\d{3})\s/', $headers[0], $matches)) {
        $status = (int) $matches[1];
    }

    return [
        'status' => $status ?: 502,
        'body' => is_string($body) ? $body : '',
    ];
}
