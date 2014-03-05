<!doctype html>
<html lang="en">
<head>
<title>WebSocket</title>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js" type="text/javascript"></script>

<style>
 html,body{font:normal 0.9em arial,helvetica;}
 #log {width:440px; height:200px; border:1px solid #7F9DB9; overflow:auto;}
 #msg {width:330px;}
 #boxRouge{
  position:absolute;
  left:0;
  top:0;
  width:50px;
  height:50px;
  background: #f00;
 }
</style>

<script>
//liste des codes des touches du clavier
KEY_DOWN  = 40;
KEY_UP    = 38;
KEY_LEFT  = 37;
KEY_RIGHT = 39;

KEY_END   = 35;
KEY_BEGIN = 36;



KEY_BACK_TAB  = 8;
KEY_TAB       = 9;
KEY_SH_TAB    = 16;
KEY_ENTER     = 13;
KEY_ESC       = 27;
KEY_SPACE     = 32;
KEY_DEL       = 46;

KEY_A   = 65;
KEY_B   = 66;
KEY_C   = 67;
KEY_D   = 68;
KEY_E   = 69;
KEY_F   = 70;
KEY_G   = 71;
KEY_H   = 72;
KEY_I   = 73;
KEY_J   = 74;
KEY_K   = 75;
KEY_L   = 76;
KEY_M   = 77;
KEY_N   = 78;
KEY_O   = 79;
KEY_P   = 80;
KEY_Q   = 81;
KEY_R   = 82;
KEY_S   = 83;
KEY_T   = 84;
KEY_U   = 85;
KEY_V   = 86;
KEY_W   = 87;
KEY_X   = 88;
KEY_Y   = 89;
KEY_Z   = 90;

KEY_PF1   = 112;
KEY_PF2   = 113;
KEY_PF3   = 114;
KEY_PF4   = 115;
KEY_PF5   = 116;
KEY_PF6   = 117;
KEY_PF7   = 118;
KEY_PF8   = 119;

REMAP_KEY_T = 5019;
  
function checkEventObj ( _event_ ){
  // --- IE explorer
  if ( window.event )
    return window.event;
  // --- Netscape and other explorers
  else
    return _event_;
}
  // action lors de l'appuie d'une touche clavier
function applyKey (_event_){
  
  
  var winObj = checkEventObj(_event_);
  
  var intKeyCode = winObj.keyCode;
  var intAltKey = winObj.altKey;
  var intCtrlKey = winObj.ctrlKey;
    
  // action avec touche alt ou ctrl appuyé
  if (intAltKey || intCtrlKey) {
    
    if ( intKeyCode == KEY_RIGHT || intKeyCode == KEY_LEFT ){
      
     
      
      
      winObj.keyCode = intKeyCode = REMAP_KEY_T;
      winObj.returnValue = false;
      return false;
    }
    
  }
// action sans touche alt ou ctrl appuyé
  else {
    
    if ( intKeyCode == KEY_DOWN ){
      
     
      conn.send('bas'); 
      
       var top=$('#boxRouge').css("top");
      var pos=top.indexOf("px");
      var number=parseInt(top.substring(0,pos))+50;
      string=number+"px"
      $('#boxRouge').css("top",string);
      // --- Map the keyCode in another keyCode not used
      winObj.keyCode = intKeyCode = REMAP_KEY_T;
      winObj.returnValue = false;
      return false;
    }
    if ( intKeyCode == KEY_UP ){
      
     
      conn.send('haut'); 
      
      var top=$('#boxRouge').css("top");
      var pos=top.indexOf("px");
      var number=parseInt(top.substring(0,pos))-50;
      string=number+"px"
      $('#boxRouge').css("top",string);
     
      winObj.keyCode = intKeyCode = REMAP_KEY_T;
      winObj.returnValue = false;
      return false;
    }
    if ( intKeyCode == KEY_LEFT ){
      
     
      conn.send('left'); 
     
      var left=$('#boxRouge').css("left");
      var pos=left.indexOf("px");
      var number=parseInt(left.substring(0,pos))-50;
      string=number+"px"
      $('#boxRouge').css("left",string);
     
      winObj.keyCode = intKeyCode = REMAP_KEY_T;
      winObj.returnValue = false;
      return false;
    }
    if ( intKeyCode == KEY_RIGHT ){
      
 
      conn.send('right'); 

         var left=$('#boxRouge').css("left");
      var pos=left.indexOf("px");
      var number=parseInt(left.substring(0,pos))+50;
      string=number+"px"
      $('#boxRouge').css("left",string);
    
      winObj.keyCode = intKeyCode = REMAP_KEY_T;
      winObj.returnValue = false;
      return false;
    }
    
  }
  
}
//appel fonction appliKey lors de l'appuie d'une touche
document.onkeydown = applyKey;
//création de la connection
var conn = new WebSocket('ws://mfc.lo:5000');
conn.onopen = function(e) {
    console.log("Connection established!");
     var gameState = JSON.parse(e.data);
     console.log(gameState);
};
//action lors de la réception d'un message
conn.onmessage = function(e) {
    console.log(e.data);
    if (e.data=='bas'){
      var top=$('#boxRouge').css("top");
      var pos=top.indexOf("px");
      var number=parseInt(top.substring(0,pos))+50;
      string=number+"px"
      $('#boxRouge').css("top",string);
    }
     if (e.data=='haut'){
       var top=$('#boxRouge').css("top");
      var pos=top.indexOf("px");
      var number=parseInt(top.substring(0,pos))-50;
      string=number+"px"
      $('#boxRouge').css("top",string);
    }
     if (e.data=='left'){
       var left=$('#boxRouge').css("left");
      var pos=left.indexOf("px");
      var number=parseInt(left.substring(0,pos))-50;
      string=number+"px"
      $('#boxRouge').css("left",string);
    }
     if (e.data=='right'){
      var left=$('#boxRouge').css("left");
      var pos=left.indexOf("px");
      var number=parseInt(left.substring(0,pos))+50;
      string=number+"px"
      $('#boxRouge').css("left",string);
    }
    
};

</script>

</head>
<body >
  <div id="boxRouge"></div>
<?php
$host=gethostbyname("mfc.lo:8080");
echo $host;
?>

</body>
</html>