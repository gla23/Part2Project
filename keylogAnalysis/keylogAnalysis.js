

function requestKeylogData(folder, participantID, gameType) {
    // Get contentsData from server
    var req = new XMLHttpRequest();
    req.onload = function(){
        readInDataReceived(this.responseText,participantID,gameType);
    };
    //req.open('GET', './Keylogs25-02/95276fod.txt');
    req.open('GET', './Keylogs'+ folder + '/'+participantID+gameType+'.txt');
    req.send();
}



// Specify data to be used in the analysis..
participantsData = [
    ["02-25","49775"],["02-25","42179"],["02-25","37185"],["02-25","38026"],["02-25","62842"],["02-25","95276"],
    ["02-28","13314"],//["02-28","27927"],["02-28","60931"],["02-28","93349"]
    ["03-05","11122"],// Anthony
    ["03-05","94392"],
    ["03-09","65984"],["03-09","73684"],["03-09","11463"],["03-09","20353"],["03-09","80390"],["03-09","32257"],
    ["03-11","81898"],["03-11","52998"],
    ["03-13","28292"],["03-13","72674"],
    ["03-14","73658"],["03-14","44368"],["03-14","10019"],["03-14","40996"],["03-14","73884"],["03-14","77208"],["03-14","87653"],
    ["03-28","14752"],["03-28","32551"],//["03-28","32842"],
    ["03-29","96730"],["03-29","14729"]
    ];
// ...and load in that data
for(x in participantsData){
    requestKeylogData(participantsData[x][0],participantsData[x][1],"gla");
    requestKeylogData(participantsData[x][0],participantsData[x][1],"fod");
}

// Make an array to store the data in, and other ones to display sections
// Format of allData array
// ["12345","gla",restartDistances,restartTimes,distances,distanceTimes,keys,survey1,survey2]
// ["Timestamp", participant ID, age, gender, how long have you played QWOP, hours of games a week]
// ["Timestamp", participant ID, Which version were you more successful at?, Which version felt like had more control, Why?, Do you think playing the first version of the game improved your performance in the second version?", "Which version did you enjoy more?", "Why do you think this was?"]
var allData = Array(participantsData.length*2);
var allGlaRestartDistances = [[],[]];
var allFodRestartDistances = [[],[]];
var allRestarts = [];
var allDistances = [];
// Log the data for inspection
console.log("participantsData:");
console.log(participantsData);
console.log("allData:");
console.log(allData);


function readInDataReceived(contents,participantID,gameType) {
    
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
                    //console.log("contentsData after game is finished: "+values[1]);
                    break dataExtractLoop;
                }

                if (values[0]=="distance"){
                    if (values[2]==null){
                        //console.log(values[1])
                    } else {
                        distanceTimes.push(values[1]);
                        distanceDistances.push(values[2]);
                    }
                } else if (values[0]=="restart"){
                    if ((values[2] != null)&&(values[2]!=0.0)) {
                        //console.log(typeof values[2] + " : " + values[2]);
                        restartTimes.push(values[1]);
                        restartDistances.push(values[2]);
                    }
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
            allData[posToInsert] = [participantID,gameType,restartDistances,restartTimes,distanceDistances,distanceTimes,keys];
        }
    }

    allRestarts.push(restartDistances);
    allDistances.push(distanceDistances);

    // ["12345","gla",restartDistances,restartTimes,distances,distanceTimes,keys]
    // ["28-02","33333",survey1,survey2]
    // ["Timestamp", participant ID, age, gender, how long have you played QWOP, hours of games a week]
    // ["Timestamp", participant ID, Which version were you more successful at?, Which version felt like had more control, Why?, Do you think playing the first version of the game improved your performance in the second version?", "Which version did you enjoy more?", "Why do you think this was?"]
    // After all data has been input do other calculations
    if(allDistances.length == 2*participantsData.length){
        onceAllKeylogDataIsLoadedIn()
    }
}

window.onload = function() {
    //console.log("running onload");
    document.getElementById("title").innerHTML = "Data analysis graphs for all "+participantsData.length+" participants";
    for (var i = 0; i < participantsData.length ; i++) {
        makeGraph(1300*0.6,400*0.6,[-4,40],1,2*i,"1",20);
        makeGraph(1300*0.6,400*0.6,[-4,40],1,2*i+1,"1",20);
    }
};
function onceAllKeylogDataIsLoadedIn() {
    //####################################################################################
    //####################################################################################
    // console.log("starting other calculations once all the data has been received.")

    // Make datasets for different groupings
    for(x in allData) {
        for(y in allData[x][2]){
            participantGroup = allData[x][0]>"45000" ? 1 : 0
            if (allData[x][1] == "gla"){
                allGlaRestartDistances[participantGroup].push(allData[x][2][y]);
            } else {
                allFodRestartDistances[participantGroup].push(allData[x][2][y]);
            }
        }
    }

    // Add survey data to participants
    // ["12345","gla",restartDistances,restartTimes,distances,distanceTimes,keys]
    // ["28-02","33333",survey1,survey2]
    // ["Timestamp", participant ID, age, gender, how long have you played QWOP, hours of games a week]
    // ["Timestamp", participant ID, Which version were you more successful at?, Which version felt like had more control, Why?, Do you think playing the first version of the game improved your performance in the second version?", "Which version did you enjoy more?", "Why do you think this was?"]
    for (var i = 0; i < participantsData.length; i++) {
        participantsData[i].push(survey[0][findParticipant(participantsData[i][1], survey[0])])
        participantsData[i].push(survey[1][findParticipant(participantsData[i][1], survey[1])])
    }


    // console.log("Arrays of all gla and fod restart distances, split into participant groups A and B: ")
    // console.log(allGlaRestartDistances);
    // console.log(allFodRestartDistances);
 
    //####################################################################################################
    // Add the 6 graphs for analysing changes of version, order of play, and participant groups
    width = 1600;
    height = 400;
    graphId = addGraphSvgElementToPage(width,height,"graphsRoot","Histogram showing the distribution of the distances reached over all runs for version gla");
    makeHistogram(graphId,[-4,40],0.5,allGlaRestartDistances[0].concat(allGlaRestartDistances[1]),"steelblue",230);
    graphId = addGraphSvgElementToPage(width,height,"graphsRoot","Histogram showing the distribution of the distances reached over all runs for version fod");
    makeHistogram(graphId,[-4,40],0.5,allFodRestartDistances[0].concat(allFodRestartDistances[1]),"steelblue",230);
    graphId = addGraphSvgElementToPage(width,height,"graphsRoot","Histogram showing the distribution of the distances reached over all attempts made during the first version played");
    makeHistogram(graphId,[-4,40],0.5,allGlaRestartDistances[0].concat(allFodRestartDistances[1]),"steelblue",230);
    graphId = addGraphSvgElementToPage(width,height,"graphsRoot","Histogram showing the distribution of the distances reached over all attempts made during the second version played");
    makeHistogram(graphId,[-4,40],0.5,allGlaRestartDistances[1].concat(allFodRestartDistances[0]),"steelblue",230);
    graphId = addGraphSvgElementToPage(width,height,"graphsRoot","Histogram showing the distribution of the distances reached over all runs for participants in group A");
    makeHistogram(graphId,[-4,40],0.5,allGlaRestartDistances[0].concat(allFodRestartDistances[0]),"steelblue",230);
    graphId = addGraphSvgElementToPage(width,height,"graphsRoot","Histogram showing the distribution of the distances reached over all runs for participants in group B");
    makeHistogram(graphId,[-4,40],0.5,allGlaRestartDistances[1].concat(allFodRestartDistances[1]),"steelblue",230);

    
    //####################################################################################################
    // Add line charts of distance over time for each participant and version
    lineData = [];
    for (var i = 0; i < 2*participantsData.length; i++) {
        lineData.push([{a:300,b:0},{a:0,b:0}]);
        arr1 = allData[i][5];
        arr2 = allData[i][4];
        for (var j = 0; j < arr1.length; j++) {
            lineData[i].push({a:arr1[j]/1000,b:arr2[j]});
        }
        // lineData[i].push({a:300,b:0});
        // lineData[i].push({a:300,b:20});
        // lineData[i].push({a:0,b:19.6});
        // lineData[i].push({a:0,b:19.6});
        // lineData[i].push({a:300,b:20});
        // Make graphs
        graphId = addGraphSvgElementToPage(1300*0.6,300,"lineGraphRoot","Line graph of distance over time, for participant "+Math.ceil((i+1)/2) +" ("+participantsData[Math.floor((i)/2)][1]+") version "+versionName(i));
        makeLineChart(graphId,lineData[i],graphId,lineData[i-1]);
    }

    // ["12345","gla",restartDistances,restartTimes,distances,distanceTimes,keys]
    // ["28-02","33333",survey1,survey2]
    // ["Timestamp", participant ID, age, gender, how long have you played QWOP, hours of games a week]
    // ["Timestamp", participant ID, Which version were you more successful at?, Which version felt like had more control, Why?, Do you think playing the first version of the game improved your performance in the second version?", "Which version did you enjoy more?", "Why do you think this was?"]
    // allGlaRestartDistances

    participants = [];
    male = [];
    female = [];
    highscores = {};
    prevExperience = {}
    for(x in participantsData){
        participants.push(participantsData[x][1]);
        //######################################
        // Calculate demographics
        survey1 = participantsData[x][2]
        survey1[2] = +survey1[2]

        // Age and gender
        if (survey1[3]=="Male"){
            male.push(survey1[2])
        } else {
            female.push(survey1[2])
        }

        // Previous experience
        if (prevExperience.hasOwnProperty(survey1[4]))
        {
            prevExperience[survey1[4]] += 1
        } else {
            prevExperience[survey1[4]] = 1
        }
    }

    console.log(prevExperience);

    graphId = addGraphSvgElementToPage(800,300,"others","Age and gender of the 30 participants");
    yAxisHeight = makeHistogram(graphId,[10,30],1,male.concat(female),"steelblue",20,[["Male Participants: 17","","steelblue"],["female participants: 13","","hotpink"],["Mean age: ","mean"]],"Number of participants","Age of participants");
    makeHistogram(graphId,[10,30],1,female,"hotpink",yAxisHeight,[]);


}

//######################################
// Questionnaire answers
surveysReceived = 0;
var survey = Array(2);
requestSurveyData("responces1.csv")
requestSurveyData("responces2.csv")
function requestSurveyData(file) {
    // Get contentsData from server
    var req = new XMLHttpRequest();
    req.onload = function(){
        readInSurvey(this.responseText);
    };
    req.open('GET', './'+file);
    req.send();
}
function readInSurvey(csvData) {
    // 
    data = $.csv.toArrays(csvData)
    surveysReceived += 1
    if (surveysReceived==2) {
        survey[1] = data;
        // Once both have been read in
        // console.log("Survey arrays");
        // console.log(survey[0]);
        // console.log(survey[1]);

        // Rest moved till after rest of data is loaded in

    } else {survey[0] = data;}
}

function findParticipant(id,thisSurvey) {
    // console.log("id: " + id);
    // console.log("survey: "); 
    // console.log(thisSurvey);
    for (var i = 1; i < thisSurvey.length; i++) {
        if (thisSurvey[i][1]==id)
            return i
    }
    console.log("BBEEEEPPPP: "+i);
    return "?"
}


// Display Graphs and Charts
function versionName(num) {
    if (num%2==0){
        return "gla"
    } else {
        return "fod"
    }
}

function addGraphSvgElementToPage(graphWidth,graphHeight,root,title) {
    var svgGraph = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // Create title of graph
    var graphTitleElement = document.createElement("B");
    var newDiv = document.createElement("div");
    newDiv.style.display = "inline-block";
    graphTitleElement.innerHTML = title;
    newDiv.appendChild(graphTitleElement);
    newDiv.appendChild(document.createElement("br"));
    newDiv.appendChild(svgGraph);
    document.getElementById(root).appendChild(newDiv);
    //document.getElementById("graphsRoot").appendChild(graphTitleElement);
    svgGraph.setAttribute("width",""+graphWidth);
    svgGraph.setAttribute("height",""+graphHeight);
    svgGraph.id = "svg"+Math.floor(Math.random() * (999999-100000))+100000;
    return svgGraph.id
}

function makeGraph(graphWidth,graphHeight,graphDomain,binSize,dataSet,type,yMin) {
    // Outdated function that is now only used for the individual graphs
    var svgGraph = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // Create title of graph
    var graphTitleElement = document.createElement("B");
    var newDiv = document.createElement("div");
    newDiv.style.display = "inline-block";
    setTimeout(function(){
        if (type=="1"){graphTitleElement.innerHTML = "Histogram showing the distribution of the distances reached for all runs for participant " +Math.ceil((dataSet+1)/2)+" ("+ allData[dataSet][0] + ") playing version " + allData[dataSet][1];
        }
        newDiv.appendChild(graphTitleElement);
        newDiv.appendChild(document.createElement("br"));
        newDiv.appendChild(svgGraph);
    }, 1000);
    document.getElementById("graphsRootIndividual").appendChild(newDiv);

    //document.getElementById("graphsRoot").appendChild(graphTitleElement);
    svgGraph.setAttribute("width",""+graphWidth);
    svgGraph.setAttribute("height",""+graphHeight);
    svgGraph.id = "svg"+Math.floor(Math.random() * (99999-10000))+10000;
    //console.log(svgGraph);
    if (dataSet=="lineChart") {
    } else {
        setTimeout(function(){makeHistogram(svgGraph.id,graphDomain,binSize,""+dataSet,"steelblue",yMin)}, 1000);
    }

}
// Next up fix y axis title in this function
function makeLineChart(svgElementId,data) {

    var svg = d3.select(document.getElementById(svgElementId)),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var x = d3.scaleLinear()
        .domain(d3.extent(data, function(d) { return d.a; }))
        .rangeRound([0, width]);

    yRange = d3.extent(data, function(d) { return d.b; });
    yRange[0] = -4;
    if (yRange[1]>60) {
        yRange[0] -= 4;
    }
    yRange[1] = Math.max(20,yRange[1]);
    var y = d3.scaleLinear()
        .domain(yRange)
        .rangeRound([height, 0]);

    var line = d3.line()
        .x(function(d) { return x(d.a); })
        .y(function(d) { return y(d.b); });
 
    g.append("g")
        .call(d3.axisBottom(x))
        .attr("transform", "translate(0," + height + ")")
        // .select(".domain")
        .append("text")
        .attr("transform", "translate(" + (width-13) + ",-6)")
        .attr("fill", "#000")
        .attr("x", 6)
        .attr("dx", "0.71em")
        .attr("text-anchor", "end")
        .text("Time (s)");

    g.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Distance from start");

    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line)

}

// ["12345","gla",restartDistances,restartTimes,distances,distanceTimes,keys,survey1,survey2]
// ["Timestamp", participant ID, age, gender, how long have you played QWOP, hours of games a week]
// ["Timestamp", participant ID, Which version were you more successful at?, Which version felt like had more control, Why?, Do you think playing the first version of the game improved your performance in the second version?", "Which version did you enjoy more?", "Why do you think this was?"]
function makeHistogram(svgElementId,graphDomain,binSize,data,colour,yMin,textSpecifiers=[["Number in dataset: ","size","black"],["Mean: ","mean","black"],["Variance: ","variance","black"]],yTitle="Number of runs",xTitle="Distance reached") {
    // Returns hight of y-axis for second histogram being placed on top that might have less data 
    // = d3.range(1000).map(d3.randomBates(10));

    if ((typeof data) == "string") {
        data = allData[data][2]
    }

    biggerElements = data.filter(
        function(evalue, index, array)
        {
            return (evalue >= graphDomain[1]);
        }
    ).sort().toString();

    var formatCount = d3.format(",.0f");

    var svg = d3.select(document.getElementById(svgElementId)),
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
    //var bins2 = d3.histogram()
        // .domain(x.domain())
        // .thresholds(x.ticks((graphDomain[1]-graphDomain[0])/binSize)) // Array of bin areas
        // .thresholds(binArray) // Array of bin areas
        // (data2);

    yAxisHeight = Math.max(yMin, d3.max(bins, function(d) { return d.length; })) // d here is the data
    var y = d3.scaleLinear()
        .domain([0, yAxisHeight]) // yscaling
        .range([height, 0]); // swap values to see


    // Add bars
    var bar = g.selectAll(".bar")
      .data(bins)
      .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; }); // Moves bars into correct place

    bar.append("rect")
        .attr("x", 0)
        .attr("fill", colour)
        //.attr("width", x(bins[0].x1) - x(bins[0].x0) - 1) // Width of bar
        .attr("width", x(bins[2].x0) - x(bins[1].x0) - 1) // Width of bar
        .attr("height", function(d) { return height - y(d.length); });

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", (x(bins[2].x0) - x(bins[1].x0)) / 2)
        .attr("text-anchor", "middle")
        .text(function(d) { 
            length = formatCount(d.length)
            if (length==0) {
                return '';
            }
            return formatCount(d.length);
        });


    // Add axis to main graphs
    if (colour=="steelblue") {
        // Add axes
        g.append("g")
            .call(d3.axisBottom(x))
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "translate(" + (width-13) + ",-6)")
            .attr("x", 6)
            .attr("dx", "0.71em")
            .attr("text-anchor", "end")
            .text(xTitle);

        g.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text(yTitle);
    }

    
    // calculate mean and variance
    var mean = 0;
    var arrayLength = data.length;
    for (var i = 0; i < arrayLength; i++) {
        mean += data[i];
    }
    mean /= arrayLength;
    var variance = 0;
    for (var i = 0; i < arrayLength; i++) {
        variance += Math.pow(data[i]-mean,2);
    }
    variance/= (arrayLength-1);

    // Add text to graph
    meanInfo = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var textYStart = 40;
    var textYIncrease = 20;
    var textRow = 0;
    function addText(colour="black",offSet,string="text") {
        meanInfo.append("text")
            .attr("x", 200+offSet)
            .attr("y", 40+textYIncrease*(textRow++))
            .attr("dy", ".35em")
            .attr("fill",colour)
            .text(string);
    }
    function stringVaue(string) {
        if (string == "mean") return mean.toFixed(1);
        if (string == "variance") return variance.toFixed(2);
        if (string == "size") return data.length;
        return string;
    }

    for (x in textSpecifiers){
        textString = "";
        textString += stringVaue(textSpecifiers[x][0]);
        if (textSpecifiers[x].length > 1) {
            textString += stringVaue(textSpecifiers[x][1]);
        }
        textColour = "black"
        if (textSpecifiers[x].length>2){
            textColour = textSpecifiers[x][2]
        }
        textOffset = 0;
        if (textSpecifiers[x].length>3)
            textOffset = textSpecifiers[x][3]
        addText(textColour,textOffset,textString);
    }
    //[["Number in dataset: ","size","black"],["Mean: ","mean","black"],["Variance: ","variance","black"]]

    if (data.length > 100) {
        if (biggerElements!="") {
            addText("black",0,"datapoints larger than "+graphDomain[1]+":")
            addText("black",0,biggerElements)
        }
    } else if (biggerElements!="") {
        addText("black",0,"datapoints larger than "+graphDomain[1]+": "+biggerElements)
    }

    // Returns hight of y-axis for second histogram being placed on top that might have less data     
    return yAxisHeight;
}

