
//"use strict";

var allDistances = [];
var allRestarts = [];
var allKeys = [];

function workWithFile(contents,dataFile) {
    console.log("running workWithFile");
    //console.log(contents);
    
    function myPop() {
        pos = contentsData.indexOf("]");
        if (pos == -1)
            return "end"
        popped = contentsData.substring(1,pos);
        contentsData = contentsData.substring(pos+1);
        return popped;
    }

    var contentsData = contents;

    var a = "";

    var distances = [];
    var distanceTimes = [];
    var restartDistances = [];
    var restartTimes = [];
    var keys = [];


    dataExtractLoop : while(true){
        a = myPop();
        if(a=="end"){
            break;
        } else {
            messages = JSON.parse("["+a+"]");
            for (x in messages){
                //console.log(messages[x]);
                values = Object.values(messages[x]);
                // Don't bother with data accidentally got after time is up.
                if (values[1]>300000){
                    console.log("contentsData after game is finished: "+values[1]);
                    break dataExtractLoop;
                }

                if (values[0]=="distance"){
                    distanceTimes.push(values[1]);
                    distances.push(values[2]);
                } else if (values[0]=="restart"){
                    restartTimes.push(values[1]);
                    restartDistances.push(values[2]);
                } else {
                    keys.push([values[0],values[1],values[2]]);
                }
            }
        } 
    }
    // add final distance to the list of end distances
    restartDistances.push(distances[distances.length-1]);
    restartTimes.push(distanceTimes[distanceTimes.length-1]);


    allDistances.push([dataFile,distanceTimes,distances]);
    allRestarts.push([dataFile,restartTimes,restartDistances]);
    allKeys.push([dataFile,keys]);


    //document.getElementById("1").innerHTML = 
}
function addData(dataFile) {
    // Get contentsData from server
    var req = new XMLHttpRequest();
    req.onload = function(){
        workWithFile(this.responseText,dataFile);
    };
    //req.open('GET', './Keylogs25-02/95276fod.txt');
    req.open('GET', './Keylogs25-02/'+dataFile+'.txt');
    req.send();
}

addData("37185fod");
addData("37185gla");
addData("38026gla");
addData("38026fod");
addData("42179gla");
addData("42179fod");
addData("49775gla");
addData("49775fod");
addData("62842gla");
addData("62842fod");
addData("95276gla");
addData("95276fod");


console.log("Distances: ");
console.log(allDistances);
console.log("Restarts: ");
console.log(allRestarts);
console.log("Keys: ");
console.log(allKeys);


window.onload = function() {
    console.log("running onload");
    setTimeout(makeGraph("svg1",[-5,15]), 900);
    setTimeout(makeGraph("svg2",[-5,25]), 900);
    setTimeout(makeGraph("svg3",[-5,35]), 900);

    setTimeout(function(){
        console.log("now doing delayed section 2");
        d3.selectAll("svg").on("click", function() {
          d3.select(this).style("color", "red");
        });
    },1000);
    
    // document.getElementById("1").innerHTML = "5";
    // document.getElementById("2").innerHTML = cat;

    // First attempt to get file
    // function readSingleFile(e) {
    //   var file = e.target.files[0];
    //   if (!file) {
    //     return;
    //   }
    //   var reader = new FileReader();
    //   reader.onload = function(e) {
    //     var contents = e.target.result;
    //     workWithFile(contents);
    //   };
    //   reader.readAsText(file);
    // }
    // document.getElementById('file-input').addEventListener('change', readSingleFile, false);

};

function makeGraph(element,graphDomain) {
    console.log("starting makeGraph")
    var data = d3.range(1000).map(d3.randomBates(10));
    data = allRestarts[0][2];
    console.log(data);

    var formatCount = d3.format(",.0f");

    var svg = d3.select(document.getElementById(element)),
        margin = {top: 10, right: 30, bottom: 30, left: 30},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
        .domain(graphDomain) // Set domain here
        .rangeRound([0, width]);

    var bins = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(20))
        (data);

    var y = d3.scaleLinear()
        .domain([0, d3.max(bins, function(d) { return d.length; })])
        .range([height, 0]);

    var bar = g.selectAll(".bar")
      .data(bins)
      .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
        .attr("height", function(d) { return height - y(d.length); });

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
        .attr("text-anchor", "middle")
        .text(function(d) { return formatCount(d.length); });

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
}