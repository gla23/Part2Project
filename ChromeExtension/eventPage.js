
console.log("eventPage.js starting");

var screenshotting_active = true;
setInterval(function() {
	if (screenshotting_active) {
		console.log("eventPage.js loop");
		updateScreenshot();
	} else {
		console.log("eventPage.js not doing loop as screenshotting_active is false");
	}
},1000);


function updateScreenshot() {
  
  chrome.tabs.captureVisibleTab(null, {}, function (image) {
     // You can add that image HTML5 canvas, or Element.

     var script = "";

     // script += 'console.log(document.getElementById("timer").getSessionTime);';
     // script += 'console.log(String.toInt(document.getElementById("timer").getSessionTime()) % 1000);';


     // Put the image into the img element
     script += 'img_element = document.getElementById("screenshot_target");';
     script += 'img_element.src = "'+image+'";';
     script += 'img_element.height = 0;';

     // Draw the image onto the larger canvas
     script += 'img_element.onload = function() {';
       script += 'canvas_element = document.getElementById("screenshot_canvas");';
       script += 'var ctx = canvas_element.getContext("2d");';
       script += 'ctx.drawImage(img_element,-10,-10);';
  	   // Get the distance text and invert
       script += 'rect = document.getElementById("iframe").getBoundingClientRect();';
       script += 'var imageData = ctx.getImageData(rect.x+205, rect.y+10, 250, 40);';
       script += 'var data = imageData.data;';
       script += 'for(var i = 0; i < data.length; i += 4) {';
         // red, green then blue
         script += 'data[i] = (255 - data[i])*2;';
         script += 'data[i + 1] = (255 - data[i + 1])*2;';
         script += 'data[i + 2] = (255 - data[i + 2])*2;';
       script += '}';

       script += 'small_canvas_element = document.getElementById("smaller_canvas");';
       script += 'var ctx2 = small_canvas_element.getContext("2d");';
       // put inverted selection into smaller canvas to use OCR on
      script += 'ctx2.putImageData(imageData, 0, 0);';
     script += '};';

     // See https://developer.chrome.com/extensions/tabs#method-executeScript.
     // chrome.tabs.executeScript allows us to programmatically inject JavaScript
     // into a page. Since we omit the optional first argument "tabId", the script
     // is inserted into the active tab of the current window, which serves as the
     // default.
     chrome.tabs.executeScript({
       code: script
     });
  });
  

}