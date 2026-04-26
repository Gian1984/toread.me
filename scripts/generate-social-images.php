<?php
/**
 * Static social image generator for toread.me.
 *
 * Generates OG/Twitter images from a blue background, centered logo,
 * and page-specific site/page labels.
 */

declare(strict_types=1);

$root = dirname(__DIR__);
$logoPath = $root . '/public/images/toread-logo.webp';
$outputDir = $root . '/public/images/social';

$pages = [
    'home' => [
        'title' => 'toread.me',
        'subtitle' => 'Private EPUB Reader',
    ],
    'about' => [
        'title' => 'toread.me',
        'subtitle' => 'Books, Code and Audio for Free Culture',
    ],
    'library' => [
        'title' => 'toread.me',
        'subtitle' => 'Free Public-Domain Ebook Library',
    ],
    'privacy' => [
        'title' => 'toread.me',
        'subtitle' => 'Privacy Policy',
    ],
];

$targets = [
    'og' => [1200, 630],
    'twitter' => [1200, 630],
    'square' => [1200, 1200],
];

if (!extension_loaded('gd')) {
    fwrite(STDERR, "GD extension is required to generate social images.\n");
    exit(1);
}

if (!file_exists($logoPath)) {
    fwrite(STDERR, "Logo not found: {$logoPath}\n");
    exit(1);
}

if (!is_dir($outputDir) && !mkdir($outputDir, 0775, true) && !is_dir($outputDir)) {
    fwrite(STDERR, "Unable to create output directory: {$outputDir}\n");
    exit(1);
}

$fontBold = find_font([
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
    '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
    '/Library/Fonts/Arial Bold.ttf',
]);

$fontRegular = find_font([
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    '/System/Library/Fonts/Supplemental/Arial.ttf',
    '/Library/Fonts/Arial.ttf',
]) ?: $fontBold;

foreach ($pages as $slug => $page) {
    foreach ($targets as $target => [$width, $height]) {
        $image = imagecreatetruecolor($width, $height);
        imagealphablending($image, true);
        imagesavealpha($image, true);

        draw_background($image, $width, $height);
        draw_logo($image, $logoPath, $width, $height, $target === 'square' ? 270 : 190);
        draw_centered_text($image, $page['title'], $fontBold, $width, $height, $target === 'square' ? 74 : 62, $target === 'square' ? 710 : 430);
        draw_centered_text($image, $page['subtitle'], $fontRegular, $width, $height, $target === 'square' ? 34 : 30, $target === 'square' ? 782 : 495);

        $output = "{$outputDir}/{$slug}-{$target}.png";
        if (!imagepng($image, $output, 6)) {
            fwrite(STDERR, "Unable to write {$output}\n");
            exit(1);
        }
        echo "Generated {$output}\n";
    }
}

function find_font(array $candidates): ?string
{
    foreach ($candidates as $candidate) {
        if (file_exists($candidate)) {
            return $candidate;
        }
    }
    return null;
}

function draw_background($image, int $width, int $height): void
{
    $top = [17, 24, 39];
    $bottom = [49, 46, 129];

    for ($y = 0; $y < $height; $y++) {
        $ratio = $y / max(1, $height - 1);
        $r = (int) round($top[0] + ($bottom[0] - $top[0]) * $ratio);
        $g = (int) round($top[1] + ($bottom[1] - $top[1]) * $ratio);
        $b = (int) round($top[2] + ($bottom[2] - $top[2]) * $ratio);
        imageline($image, 0, $y, $width, $y, imagecolorallocate($image, $r, $g, $b));
    }

    $indigo = imagecolorallocatealpha($image, 79, 70, 229, 72);
    $cyan = imagecolorallocatealpha($image, 14, 165, 233, 102);
    imagefilledellipse($image, (int) ($width * 0.22), (int) ($height * 0.18), (int) ($width * 0.64), (int) ($height * 0.74), $indigo);
    imagefilledellipse($image, (int) ($width * 0.82), (int) ($height * 0.82), (int) ($width * 0.74), (int) ($height * 0.5), $cyan);

    $border = imagecolorallocatealpha($image, 255, 255, 255, 104);
    imagesetthickness($image, 3);
    imagerectangle($image, 26, 26, $width - 26, $height - 26, $border);
}

function draw_logo($image, string $logoPath, int $width, int $height, int $targetSize): void
{
    $logo = imagecreatefromwebp($logoPath);
    if (!$logo) {
        return;
    }

    $logoW = imagesx($logo);
    $logoH = imagesy($logo);
    $size = min($targetSize, $width - 120, $height - 240);
    $resized = imagecreatetruecolor($size, $size);
    imagealphablending($resized, false);
    imagesavealpha($resized, true);
    imagefill($resized, 0, 0, imagecolorallocatealpha($resized, 0, 0, 0, 127));
    imagecopyresampled($resized, $logo, 0, 0, 0, 0, $size, $size, $logoW, $logoH);

    $x = (int) (($width - $size) / 2);
    $y = (int) (($height * 0.42) - ($size / 2));
    imagecopy($image, $resized, $x, $y, 0, 0, $size, $size);

}

function draw_centered_text($image, string $text, ?string $font, int $width, int $height, int $fontSize, int $baseline): void
{
    $white = imagecolorallocate($image, 255, 255, 255);
    $muted = imagecolorallocate($image, 199, 210, 254);
    $color = $fontSize > 40 ? $white : $muted;

    if ($font && function_exists('imagettfbbox')) {
        $bbox = imagettfbbox($fontSize, 0, $font, $text);
        $textWidth = abs($bbox[2] - $bbox[0]);
        $x = (int) (($width - $textWidth) / 2);
        imagettftext($image, $fontSize, 0, $x, $baseline, $color, $font, $text);
        return;
    }

    $fallbackFont = 5;
    $textWidth = imagefontwidth($fallbackFont) * strlen($text);
    imagestring($image, $fallbackFont, (int) (($width - $textWidth) / 2), $baseline, $text, $color);
}
