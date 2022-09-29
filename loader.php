<?php
if($_SERVER['argc'] !== 2)
    throw new Error('Internal server error');
$args = json_decode(base64_decode($_SERVER['argv'][1]), true);

$_HEADERS = [];

$_SERVER['REMOTE_ADDR'] = $args['ip'];
foreach($args['headers'] as $key => $value)
    $_HEADERS[strtoupper(str_replace('-', '_', $key))] = $value;
$_SERVER['REQUEST_METHOD'] = $args['method'];

foreach($_HEADERS as $key => $value)
    $_SERVER['HTTP_' . $key] = $value;

function getallheaders() {
    global $_HEADERS;
    return $_HEADERS;
}

print_r(getallheaders());
?>