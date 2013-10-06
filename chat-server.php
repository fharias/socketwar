<?php
use Ratchet\Server\IoServer;
use Ratchet\WebSocket\WsServer;
use SocketWar\Chat;

//This script is intended to be executed from the command line, so exit if it's called from anywhere else.
if(php_sapi_name() !== "cli") {
    exit;
}

require 'vendor/autoload.php';

$server = IoServer::factory(
	new WsServer(new Chat())
  , 8080
);

$server->run();