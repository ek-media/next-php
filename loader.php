<?php
if(isset($_SERVER['argv'])) {
    if($_SERVER['argc'] !== 2)
        throw new Error('Internal server error');
    $args = json_decode(base64_decode($_SERVER['argv'][1]), true);
} else {
    if(!isset($_GET['NEXTJS_PAYLOAD']))
        throw new Error('Internal server error');
    $args = json_decode(base64_decode($_GET['NEXTJS_PAYLOAD']), true);
}
print_r($args);
die();

$_HEADERS = [];

$_SERVER['REMOTE_ADDR'] = $args['ip'];
foreach($args['headers'] as $key => $value)
    $_HEADERS[strtoupper(str_replace('-', '_', $key))] = $value;
$_SERVER['REQUEST_METHOD'] = $args['method'];

foreach($_HEADERS as $key => $value)
    $_SERVER['HTTP_' . $key] = $value;

print_r($_GET);
?>