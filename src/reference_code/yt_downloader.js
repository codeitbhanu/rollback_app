function yt() {
  var data = document.getElementById("data").value
	eel.ytdownload(data)(setImage)
}


function setImage(base64) {
	document.getElementById("qr").src = base64
}

$(document).bind("contextmenu",function(e){
  return false;
    });
