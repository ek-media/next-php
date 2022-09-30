<?php
if(isset($_SERVER['argv'])) {
    // CLI
    if($_SERVER['argc'] !== 2)
        throw new Error('Internal server error');
    $args = json_decode(base64_decode($_SERVER['argv'][1]), true);
} else {
    // CGI
    if(!isset($_GET['NEXTJS_PAYLOAD']))
        throw new Error('Internal server error');
    $args = json_decode(base64_decode($_GET['NEXTJS_PAYLOAD']), true);
}

$_HEADERS = [];

$_SERVER['REMOTE_ADDR'] = $args['ip'];
foreach($args['headers'] as $key => $value)
    $_HEADERS[strtoupper(str_replace('-', '_', $key))] = $value;
$_SERVER['REQUEST_METHOD'] = $args['method'];

foreach($_HEADERS as $key => $value)
    $_SERVER['HTTP_' . $key] = $value;

foreach(scandir($args['document_root'] . '/php') as $file) {
    if(!in_array($file, ['.', '..']))
        require($args['document_root'] . '/php/' . $file);
}

$app = new Application();

if(file_exists($args['document_root'] . '/api/index.php'))
    $file = $args['document_root'] . '/api/index.php';

if(!isset($file))
    throw new Error('Route not found');

require($file);

if(!isset($app->methods[$args['method']]))
    throw new Error('Method not allowed');

$request = new Request($args['method']);
$response = new Response();

try {
    $output = $app->methods[$args['method']]($request, $response);
    echo json_encode([
        'response' => $response->__toJson(),
        'output' => $output,
        'error' => null,
        'success' => true
    ]);
} catch(Error $error) {
    echo json_encode([
        'response' => $response,
        'output' => null,
        'error' => [
            'message' => $error->getMessage(),
            'code' => $error->getCode(),
            'file' => $error->getFile(),
            'line' => $error->getLine(),
            'trace' => $error->getTrace()
        ],
        'success' => false
    ]);
}
?>