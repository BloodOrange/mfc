<?php
namespace MyApp;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Bomberman implements MessageComponentInterface {
    protected $clients;
    protected $json='{
    "board": {
        "width": 10,
        "height": 10,
        "tiles": [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ]
    },

    "players": [
        {
            "id": 0,
            "pseudo": "cactus",
            "color": 2,
            "x": 2,
            "y": 4,
            "score": 0
        },
        {
            "id": 1,
            "pseudo": "personne",
            "color": 3,
            "x": 5,
            "y": 8,
            "score": 18
        },
        {
            "id": 2,
            "pseudo": "nico",
            "color": 0,
            "x": 7,
            "y": 3,
            "score": 13
        }
    ]
}';
    public function __construct() {
        $this->clients = new \SplObjectStorage;

    }
    // action ouverture connection
    public function onOpen(ConnectionInterface $conn) {
       
        $this->clients->attach($conn);
        
        //$json=file_get_contents("http://mfc.lo:8080/json-test.json");
     
        foreach ($this->clients as $client) {
            $client->send($this->json);
        }
     
        echo "New connection! ({$conn->resourceId})\n";
    }
     //action à la réception d'un message
    public function onMessage(ConnectionInterface $from, $msg) {
        $numRecv = count($this->clients) - 1;
        echo sprintf('Connection %d sending message "%s" to %d other connection%s' . "\n"
            , $from->resourceId, $msg, $numRecv, $numRecv == 1 ? '' : 's');

     
        foreach ($this->clients as $client) {
            $client->send($this->json);
        }
        foreach ($this->clients as $client) {
            if ($from !== $client) {
                
                $client->send($msg);
            }
        }
    }
// action à la déconnexion d'un client
    public function onClose(ConnectionInterface $conn) {
       
        $this->clients->detach($conn);

        echo "Connection {$conn->resourceId} has disconnected\n";
    }
// action lors d'une erreur
    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";

        $conn->close();
    }

    public function onJoin(ConnectionInterface $from, $msg)
    {
        # code...
        $array=json_decode($this->json,true);
        foreach ($array as $key => $value) {
            if ($key=='players'){
                $lastIndex=array_pop(array_keys($value));
                $lastIndex++;
               
                $value[$lastIndex]=array("id"=>$lastIndex,"pseudo"=>$msg,"color"=>4,"x"=>1,"y"=>6,"score"=>14);
                array_push($array,$value[$lastIndex]);
            }
        }
       // $this->json=json_encode(value)
        $json=json_encode($array);
        $this->json=$json;
        foreach ($this->clients as $client) {
            $client->send($this->json);
        }
    }

}