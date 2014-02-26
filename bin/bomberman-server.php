<?php
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use MyApp\Bomberman;

    require dirname(__DIR__) . '/vendor/autoload.php';
//launch server
    $server = IoServer::factory(
        new HttpServer(
            new WsServer(
                new Bomberman()
            )
        ),
        8080
    );

    $server->run();