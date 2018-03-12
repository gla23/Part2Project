
function addData(folder, participantID, gameType) {
    // Get contentsData from server
    var req = new XMLHttpRequest();
    req.onload = function(){
        workWithFile(this.responseText,participantID,gameType);
    };
    //req.open('GET', './Keylogs25-02/95276fod.txt');
    req.open('GET', './Keylogs'+ folder + '/'+participantID+gameType+'.txt');
    req.send();
}


// load in collected data 
participantsData = [
    ["02-25","37185"],["02-25","38026"],["02-25","42179"],["02-25","49775"],["02-25","62842"],["02-25","95276"],
    ["02-28","13314"],//["02-28","27927"],["02-28","60931"],["02-28","93349"]
    ["03-05","11122"],["03-05","94392"],
    ["03-09","65984"],["03-09","73684"],["03-09","11463"],["03-09","20353"],["03-09","80390"],["03-09","32257"],
    ["03-11","81898"],["03-11","31323"],["03-11","52998"]
    ];

// ["12345","gla",restartDistances,restartTimes,distances,distanceTimes,keys]
var allData = Array(participantsData.length*2);
var allGlaRestartDistances = [];
var allFodRestartDistances = [];
allData.number_added = 0;


for(x in participantsData){
    addData(participantsData[x][0],participantsData[x][1],"gla");
    addData(participantsData[x][0],participantsData[x][1],"fod");
}

console.log("participantsData:");
console.log(participantsData);
console.log("allData:");
console.log(allData);

// Make array to see datasets clearly
allRestarts = [];
// console.log("Restarts: ");
// console.log(allRestarts);
allDistances = [];
// console.log("Distances: ");
// console.log(allDistances);

// console.log("Distances: ");
// console.log(allDistances);
// console.log("Keys: ");
// console.log(allKeys);

function workWithFile(contents,participantID,gameType) {
    //console.log("running workWithFile");
    //console.log(contents);
    
    function myPop() {
        pos = contentsData.indexOf("]");
        if (pos == -1)
            return "end"
        popped = contentsData.substring(1,pos);
        contentsData = contentsData.substring(pos+1);
        return popped;
    }

    // Initialise variables
    var contentsData = contents;
    var a = "";

    var restartDistances = [];
    var restartTimes = [];
    var distanceDistances = [];
    var distanceTimes = [];
    var keys = [];


    dataExtractLoop : while(true){
        a = myPop();
        if(a=="end"){
            break;
        } else {
            messages = JSON.parse("["+a+"]");
            for (x in messages){
                // For each message in the buffer chunk
                //console.log(messages[x]);
                values = Object.values(messages[x]);

                // Don't bother with data accidentally got after time is up.
                if (values[1]>300000){
                    console.log("contentsData after game is finished: "+values[1]);
                    break dataExtractLoop;
                }

                if (values[0]=="distance"){
                    distanceTimes.push(values[1]);
                    distanceDistances.push(values[2]);
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
    restartDistances.push(distanceDistances[distanceDistances.length-1]);
    restartTimes.push(distanceTimes[distanceTimes.length-1]);

    // Add all the data of the participant into the array of participants (in the right order)
    // find correct position in the array
    for (var i = 0; i < participantsData.length; i++) {
        if (participantsData[i][1]==participantID) {
            posToInsert = 2*i;
            if (gameType=="fod")
            {
                posToInsert += 1;
            }
            //console.log("position: "+posToInsert+" : "+participantID)
            allData[posToInsert] = [participantID,gameType,restartDistances,restartTimes,distanceDistances,distanceTimes,keys];
        }
    }

    allRestarts.push(restartDistances);
    allDistances.push(distanceDistances);

    // ["12345","gla",restartDistances,restartTimes,distances,distanceTimes,keys]
    // After all data has been input do other calculations
    if(allDistances.length == 2*participantsData.length){
        console.log("starting other calculations once all the data has been received.")

        // Work out other stuff
        for(x in allData) {
            for(y in allData[x][2])
            if (allData[x][1] == "gla"){
                allGlaRestartDistances.push(allData[x][2][y]);
            } else {
                allFodRestartDistances.push(allData[x][2][y]);
            }
        }
        console.log(allFodRestartDistances);
        console.log(allGlaRestartDistances);

        // Add some extra graphs
        makeGraph(1300,800,[-4,90],1,"fish","2");
        makeGraph(1300,800,[-4,90],1,"fish","3");
    }
}
window.onload = function() {
    console.log("running onload");
    for (var i = 0; i < participantsData.length ; i++) {
        makeGraph(900,400,[-4,90],1,2*i,"1");
        makeGraph(900,400,[-4,40],1,2*i+1,"1");
    }
};


function makeGraph(graphWidth,graphHeight,graphDomain,binSize,dataSet,type) {
    var svgGraph = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // Create title of graph
    var graphTitleElement = document.createElement("B");
    var newDiv = document.createElement("div");
    newDiv.style.display = "inline-block";
    setTimeout(function(){
        if (type=="1"){
            graphTitleElement.innerHTML = "participant " + allData[dataSet][0] + " playing version " + allData[dataSet][1];
        }
        if (type=="2"){
            graphTitleElement.innerHTML = "Total over all games of my version";
        }
        if (type=="3"){
            graphTitleElement.innerHTML = "Total over all games of the original QWOP";
        }
        newDiv.appendChild(graphTitleElement);
        newDiv.appendChild(document.createElement("br"));
        newDiv.appendChild(svgGraph);
    }, 1000);
    
    document.getElementById("graphsRoot").appendChild(newDiv);
    //document.getElementById("graphsRoot").appendChild(graphTitleElement);
    svgGraph.setAttribute("width",""+graphWidth);
    svgGraph.setAttribute("height",""+graphHeight);
    svgGraph.id = "svg"+Math.floor(Math.random() * (99999-10000))+10000;
    //console.log(svgGraph);
    setTimeout(function(){makeHistogram(svgGraph.id,graphDomain,binSize,dataSet,type)}, 1000);
}

// ["12345","gla",restartDistances,restartTimes,distances,distanceTimes,keys]

function makeHistogram(element,graphDomain,binSize,dataSet,type) {
    //console.log("starting makeHistogram")
    var data; // = d3.range(1000).map(d3.randomBates(10));
    if (type==1) {
        data = allData[dataSet][2]
    }
    if (type==2) {
        data = allGlaRestartDistances;
    }
    if (type==3) {
        data = allFodRestartDistances;
    }

    //console.log(data);

    var formatCount = d3.format(",.0f");

    var svg = d3.select(document.getElementById(element)),
        margin = {top: 10, right: 30, bottom: 30, left: 30},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
        .domain(graphDomain) // Set domain here
        .rangeRound([0, width]); // Size of x-axis

    binArray = [];
    for (var i = graphDomain[0]; i < graphDomain[1]; i+=binSize) {
        binArray.push(i);
    }

    var bins = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks((graphDomain[1]-graphDomain[0])/binSize)) // Array of bin areas
        .thresholds(binArray) // Array of bin areas
        (data);

    var y = d3.scaleLinear()
        .domain([0, d3.max(bins, function(d) { return d.length; })]) // yscaling
        .range([height, 0]); // Not sure

    var bar = g.selectAll(".bar")
      .data(bins)
      .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; }); // Moves bars into correct place

    bar.append("rect")
        .attr("x", 0)
        //.attr("width", x(bins[0].x1) - x(bins[0].x0) - 1) // Width of bar
        .attr("width", x(bins[2].x0) - x(bins[1].x0) - 1) // Width of bar
        .attr("height", function(d) { return height - y(d.length); });

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", (x(bins[2].x0) - x(bins[1].x0)) / 2)
        .attr("text-anchor", "middle")
        .text(function(d) { return formatCount(d.length); });

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
}