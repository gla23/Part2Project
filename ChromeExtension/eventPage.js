
alert("eventPage.js starting");

chrome.tabs.query({
     currentWindow: true,
     "index": 0
 }, function (currentTabs) {
     startUp(currentTabs[0].id);
 });

function startUp(gameTabId) {
	var screenshotting_active = true;
	// alert(gameTabId + ":jd");
	setInterval(function() {
		if (screenshotting_active) {
			// console.log("eventPage.js loop");
			updateScreenshot(gameTabId);
		} else {
			console.log("eventPage.js not doing loop as screenshotting_active is false");
		}
	},1000);
};




function updateScreenshot(gameTabId) {
  
  chrome.tabs.captureVisibleTab(null, {}, function (image) {
     // You can add that image HTML5 canvas, or Element.

     var script = "";

     // script += 'console.log(document.getElementById("timer").getSessionTime);';
     // script += 'console.log(String.toInt(document.getElementById("timer").getSessionTime()) % 1000);';
     //script += 'console.log("");';

     // Put the image into the img element
     script += 'img_element = document.getElementById("screenshot_target");';
     script += 'img_element.src = "'+image+'";';
     //script += 'img_element.height = 0;';
     script += 'document.getElementById("ocr2").innerHTML = "";';


     // Draw the image onto the larger canvas
     script += 'img_element.onload = function() {';
       script += 'canvas_element = document.getElementById("screenshot_canvas");';
       script += 'var ctx = canvas_element.getContext("2d");';
       script += 'ctx.drawImage(img_element,0,0);';
  	   // Get the distance text and invert
       script += 'rect = document.getElementById("iframe").getBoundingClientRect();';
       script += 'var imageData = ctx.getImageData(rect.x+215, rect.y+20, 130, 40);';
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
     
     console.log("eventPage.js loop");
     
     
     chrome.tabs.executeScript(gameTabId,{
       code: script
     });
  });
  

};