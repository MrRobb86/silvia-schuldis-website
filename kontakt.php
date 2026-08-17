<?php
/**
 * Kontaktformular — Versand über den Mailserver von ALL-INKL.
 *
 * Ersetzt Formspree: kein US-Dienstleister mehr in der Kette, kein Monatslimit,
 * keine Speicherung der Nachricht bei einem Dritten. Die Mail geht direkt vom
 * Webspace an das Postfach von Silvia.
 *
 * Empfänger und Absender stehen bewusst direkt hier und nicht in einer
 * Konfigurationsdatei oberhalb des Web-Roots: Die Adresse steht ohnehin offen
 * im Impressum, in der Datenschutzerklärung und in js/kontakt.js. Sie zu
 * verstecken hätte nichts geschützt, aber einen zusätzlichen Handgriff per FTP
 * gekostet — und wäre die Datei je vergessen worden, hätte das Formular
 * stillschweigend 500 geliefert.
 *
 * Absender MUSS an silviaschuldis.de hängen: Der SPF-Record der Domain
 * (v=spf1 a mx include:spf.kasserver.com ~all) deckt nur kasserver-Absender ab.
 * Eine fremde Absenderadresse landet zuverlässig im Spam.
 */
declare(strict_types=1);

const EMPFAENGER = 'silvia@silviaschuldis.de';
const ABSENDER   = 'silvia@silviaschuldis.de';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

/** Antwort senden und beenden. */
function antwort(int $code, array $daten): never
{
    http_response_code($code);
    echo json_encode($daten, JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    antwort(405, ['ok' => false, 'error' => 'method']);
}

// Spam-Falle: das Feld ist für Menschen unsichtbar. Ist es gefüllt, war es ein Bot.
// Der Bot bekommt bewusst "ok" zurück, damit er nicht mit Varianten weiterprobiert.
if (trim((string) ($_POST['_gotcha'] ?? '')) !== '') {
    antwort(200, ['ok' => true]);
}

$name     = trim((string) ($_POST['name'] ?? ''));
$email    = trim((string) ($_POST['email'] ?? ''));
$telefon  = trim((string) ($_POST['telefon'] ?? ''));
$anliegen = trim((string) ($_POST['anliegen'] ?? ''));
$nachricht = trim((string) ($_POST['nachricht'] ?? ''));
$privacy  = trim((string) ($_POST['privacy'] ?? ''));

if (
    $name === ''
    || $nachricht === ''
    || $privacy === ''
    || !filter_var($email, FILTER_VALIDATE_EMAIL)
) {
    antwort(422, ['ok' => false, 'error' => 'validation']);
}

// Grobe Längenbegrenzung — schützt das Postfach vor aufgeblähten Einsendungen.
if (mb_strlen($name) > 120 || mb_strlen($nachricht) > 8000 || mb_strlen($email) > 200) {
    antwort(422, ['ok' => false, 'error' => 'length']);
}

/** Zeilenumbrüche entfernen — sonst ließen sich Mail-Header einschmuggeln. */
function einzeilig(string $wert): string
{
    return trim(preg_replace('/[\r\n\t]+/u', ' ', $wert) ?? '');
}

$name     = einzeilig($name);
$telefon  = einzeilig($telefon);
$anliegen = einzeilig($anliegen);
$emailSicher = einzeilig($email);

$betreff = 'Neue Anfrage über deine Website';
if ($anliegen !== '') {
    $betreff .= ': ' . mb_substr($anliegen, 0, 80);
}

$zeilen = [
    'Name:      ' . $name,
    'E-Mail:    ' . $emailSicher,
    'Telefon:   ' . ($telefon !== '' ? $telefon : '—'),
    'Anliegen:  ' . ($anliegen !== '' ? $anliegen : '—'),
    '',
    'Nachricht:',
    $nachricht,
    '',
    str_repeat('-', 52),
    'Gesendet über das Kontaktformular auf silviaschuldis.de',
    'Zeitpunkt: ' . date('d.m.Y H:i') . ' Uhr',
];
$text = implode("\n", $zeilen) . "\n";

$absender = ABSENDER;
$empfaenger = EMPFAENGER;

$header = [
    'From: Website silviaschuldis.de <' . $absender . '>',
    'Reply-To: ' . mb_encode_mimeheader($name, 'UTF-8') . ' <' . $emailSicher . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];

$gesendet = mail(
    $empfaenger,
    mb_encode_mimeheader($betreff, 'UTF-8'),
    $text,
    implode("\r\n", $header),
    '-f' . $absender
);

if (!$gesendet) {
    error_log('kontakt.php: mail() ist fehlgeschlagen.');
    antwort(500, ['ok' => false, 'error' => 'send']);
}

antwort(200, ['ok' => true]);
