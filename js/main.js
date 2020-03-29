/*
Geography 575 D3 Project
Author: Kyle Roebling
Date: 3/14/2020
Description: This map looks at the South Carolina Democratic Primary (2020). It looks at the 
percentage of vote for Biden,Buttigieg,Gabbard,Klobuchar,Sanders,Steyer and Warren along with the 
demographics of race,age,income and education to discover insights on the profiles of candiates support
base.
*/

//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

//pseudo-global variables
var attrArray = ["GEO_ID","NAME","Biden","Buttigieg","Gabbard","Klobuchar","Sanders","Steyer","Warren","WhitePercentage","BlackPercentage","20_54%","55_85+%","UniversityDegree"];

var expressedArray = ["Biden","Buttigieg","Gabbard","Klobuchar","Sanders","Steyer","Warren"];
var expressed = expressedArray[0]; //initial attribute
    
//chart frame dimensions
var chartWidth = window.innerWidth * 0.55,
    chartHeight = 400,
    leftPadding = 25,
    rightPadding = 2,
    topBottomPadding = 5,
    chartInnerWidth = chartWidth - leftPadding - rightPadding,
    chartInnerHeight = chartHeight - topBottomPadding * 2,
    translate = "translate(" + leftPadding + "," + topBottomPadding + ")";
    
//stacked bar chart dimensions
var stackMargin = {top: 25, right: 30, bottom: 20, left: 50},
    stackWidth = window.innerWidth * 0.95 - stackMargin.left - stackMargin.right,
    stackHeight = 400 - stackMargin.top - stackMargin.bottom;
    
// scatter chart dimension
var scatterMargin = {top: 10, right: 30, bottom: 30, left: 60},
    scatterWidth = window.innerWidth * 0.45 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 400 - scatterMargin.top - scatterMargin.bottom;

//create a scale to size bars proportionally to frame and for axis
var yScale = d3.scaleLinear()
    .range([390, 0])
    .domain([0, 100]);


//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){
    
    //map frame dimensions
    var width = window.innerWidth * 0.40,
        height = 400;
    
    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);
    
    //create Albers equal area conic projection centered on France
    var projection = d3.geoAlbers()
        .center([0, 33.83])
        .rotate([81.16, 0, 0])
        .parallels([43, 62])
        .scale(6000)
        .translate([width / 2, height / 2]);
    
    // create projection path generator
    var path = d3.geoPath()
        .projection(projection);
    
    
    // Download csv dataset and json counties for South Carolina
    Promise.all([
          d3.csv("./data/SouthCarolina_Data.csv"),
          d3.json("./data/SouthCarolina_Counties.json")
        ]).then(function(data) {
        
            //csv data
            csvData = data[0];
        
            //join csv data to geojson
            counties = joinData(data);
        
            //create the color scale
            var colorScale = makeColorScale(data[0]);
        
            //create map
            addCounties(counties,map,path,colorScale);
        
            //create bar chart
            setChart(csvData, colorScale);
        
            //create dropdown
            createDropdown(csvData);
        
            //create stacked chart
            create_stackChart(csvData);
        
        
        
        //console.log(counties);

        });

};// End of set map function
   
//This function joins the csv data to the GeoJson layer
function joinData(data){
    
            dataset = data[0];
            //Convert topojson into geojson format
            counties = topojson.feature(data[1],data[1].objects.SouthCarolina_Counties).features;
            
            //Join the csv file to the geojson file
            //variables for data join
    
            //loop through csv to assign each set of csv attribute values to geojson region
            for (var i=0; i < dataset.length; i++){
                var csvCounty = dataset[i]; //the current region
                var csvKey = csvCounty.GEO_ID; //the CSV primary key

                //loop through geojson regions to find correct region
                for (var a=0; a < counties.length; a++){
                    var geojsonProps = counties[a].properties; //the current region geojson properties
                    var geojsonKey = geojsonProps.FIPS; //the geojson primary key

                    //where primary keys match, transfer csv data to geojson properties object
                    if (geojsonKey == csvKey){

                        //assign all attributes and values
                        attrArray.forEach(function(attr){
                            if (attr === "NAME"){
                                var val = csvCounty[attr];
                                geojsonProps[attr] = val; //assign attribute and value to geojson properties
                            }else {
                                var val = parseFloat(csvCounty[attr]); //get csv attribute value
                                geojsonProps[attr] = val; //assign attribute and value to geojson properties
                            }
                            
                            
                        });
                    };
                };
                            
            };
    return counties;
};
    
//Function that adds counties to the map
function addCounties(counties,map,path,colorScale){
    
        //add South Carolina Counites to map
        var regions = map.selectAll(".SouthCarolina_Counties")
            .data(counties)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "counties _" + d.properties.FIPS;
            })
            .attr("d", path)
            .style("fill", function(d){
            return colorScale(d.properties[expressed]);
            })
            .on("mouseover", function(d){
                highlight("._" + d.properties.FIPS,d.properties);
            })
            .on("mouseout", function(d){
                dehighlighted("._" + d.properties.FIPS)
            })
            .on("mousemove", moveLabel);
        
        var desc = regions.append("desc")
            .text('{"stroke": "#CCC", "stroke-width": "0.5px"}');
};
    
//Function to create the color scale for the choropleth map
    
function makeColorScale(data){
    
    var colorClasses = [
        "#eff3ff",
        "#bdd7e7",
        "#6baed6",
        "#3182bd",
        "#08519c"
    ];
    
//create color scale generator
var colorScale = d3.scaleQuantile()
    .range(colorClasses);

//build array of all values of the expressed attribute
var domainArray = [];
for (var i=0; i<data.length; i++){
    var val = parseFloat(data[i][expressed]);
    domainArray.push(val);
};

//assign array of expressed values as scale domain
colorScale.domain(domainArray);
    
return colorScale;
};
    

//function to create coordinated bar chart
function setChart(data){

  //create a second svg element to hold the bar chart
 var svg = d3.select("body")
    .append("svg")
    .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
    .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + scatterMargin.left + "," + scatterMargin.top + ")");
    
  // Add X axis
  var x = d3.scaleLinear()
    .domain([0, 100])
    .range([ 0, scatterWidth ]);
  svg.append("g")
    .attr("transform", "translate(0," + scatterHeight + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 100])
    .range([ scatterHeight, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));
    
  // Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
  // Its opacity is set to 0: we don't see it by default.
  var tooltip = d3.select("#my_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")



  // A function that change this tooltip when the user hover a point.
  // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
  var mouseover = function(d) {
    tooltip
      .style("opacity", 1)
  }

  var mousemove = function(d) {
    tooltip
      .html(d.NAME + ":" + "<br>" + "Biden Vote: " + d.Biden + "<br>" + "Black Perentage: " + d.BlackPercentage)
      .style("left", (d3.mouse(this)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("top", (d3.mouse(this)[1]) + "px")
  }

  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  var mouseleave = function(d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }

  // Add dots
 var circles = svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("class", function(d) {return "circles _" + d.GEO_ID})
      .attr("cx", function (d) { return x(d.Biden); } )
      .attr("cy", function (d) { return y(d.BlackPercentage); } )
      .attr("r", 7)
      .style("fill", "blue")
      .style("opacity", .5)
      .style("stroke", "white")
      .style("stroke-width", "1px")
      .on("mouseover", function(d){
                highlight("._" + d.GEO_ID,d);
            })
      .on("mouseout", function(d){
                dehighlighted("._" + d.GEO_ID)
            })
      .on("mousemove", moveLabel);
    
  var desc = circles.append("desc")
        .text('{"stroke": "white", "stroke-width": "1px"}');


};
    
//Function to create dropdown menu for attribute selection
function createDropdown(csvData){
    //add select element
    var dropdown = d3.select("body")
        .append("select")
        .attr("class", "dropdown")
        .on("change", function(){
            changeAttribute(this.value, csvData)
        });
    
    //add initial option
    var titleOption = dropdown.append("option")
        .attr("class", "titleOption")
        .attr("disabled", "true")
        .text("Select Attribute")
    
    //add attribute name options
    var attrOptions = dropdown.selectAll("attrOptions")
        .data(expressedArray)
        .enter()
        .append("option")
        .attr("value", function(d) {return d})
        .text(function(d){return d});
}
    
//dropdown change listener handler
function changeAttribute(attribute, csvData){
    //change the expressed attribute
    expressed = attribute;
    
    //recreate the color scale
    var colorScale = makeColorScale(csvData);
    
    //recolor enumeration units
    var regions = d3.selectAll(".counties")
        .transition()
        .duration(1000)
        .style("fill", function(d){
            return colorScale(d.properties[expressed]);
            });
    
    //re-sort, resize, recolor bars
    var bars = d3.selectAll(".bars")
        //re-sort bars
        .sort(function(a,b){
             return b[expressed] - a[expressed];
        })
        .transition()
        .delay(function(d,i){
            return i * 20
        })
        .duration(500);
    
    //call update chart function
    updateChart(bars,csvData.length,colorScale);
};
    
//Function to update chart data
function updateChart(bars,n,colorScale){
    bars.attr("x", function(d, i){
        return i * (chartInnerWidth / n) + leftPadding;
    })
        .attr("height", function(d){
            return 390 - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        .style("fill", function(d){
            return colorScale(d[expressed]);
            });
       var chartTitle = d3.select(".chartTitle")
        .text(expressed);
};
    
//function to highlight enumeration units and bars
function highlight(props,labelProps){
    console.log(props);
    //change stroke
    var selected = d3.selectAll(props)
        .style("stroke", "#fc0394")
        .style("stroke-width", "2.5");

    //call set label function
    setLabel(labelProps);
};
    
//function to reset the element style on mouseout
function dehighlighted(props){
    var selected = d3.selectAll(props)
        .style("stroke", function(){
            return getStyle(this, "stroke")
        })
        .style("stroke-width", function(){
            return getStyle(this, "stroke-width")
        })
    
       function getStyle(element, styleName){
            var styleText = d3.select(element)
                .select("desc")
                .text();
        
            var styleObject = JSON.parse(styleText);
     
            return styleObject[styleName];
       };  
    
    //below Example 2.4 line 21...remove info label
    d3.select(".infolabel")
        .remove();
};
    
//function to create dynamic label
function setLabel(props){

    //label content 
    var labelAttribute = "<h1>" + expressed +
        "<b>" + " "+ props[expressed] + " % </b></h1>";
    
    //create info label div
    var infolabel = d3.select("body")
        .append("div")
        .attr("class", "infolabel")
        .attr("id", props.GEO_ID + "_label")
        .html(labelAttribute);
    
    var countyName = infolabel.append("div")
        .attr("class", "labelname")
        .html(props.name);
    
};
   

//function to move info label with mouse
function moveLabel(){
    //get width of label
    var labelWidth = d3.select(".infolabel")
        .node()
        .getBoundingClientRect()
        .width;
    
    
    //use coordinates of mousemove event to set label coordinates
    var x1 = d3.event.clientX + 10,
        y1 = d3.event.clientY - 75,
        x2 = d3.event.clientX - labelWidth - 10,
        y2 = d3.event.clientY + 25;
        
    //horizontel label coordinate, testing for overflow
    var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1;
    //vertical label coordinate, testing for overflow
    var y = d3.event.clientY < 75 ? y2 : y1;
    
    
    d3.select(".infolabel")
        .style("left", x + "px")
        .style("top", y + "px");
};  
    
function create_stackChart(data){
    
   // append the svg object to the body of the page
  var svg = d3.select("body")
    .append("svg")
    .attr("width", stackWidth + stackMargin.left + stackMargin.right)
    .attr("height", stackHeight + stackMargin.top + stackMargin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + stackMargin.left + "," + stackMargin.top + ")");
  
    // List of subgroups 
  var subgroups = ['Biden','Sanders','Steyer','Buttigieg','Warren','Klobuchar','Gabbard']

  // List of groups -> I show them on the X axis

  var groups = d3.map(data, function(d){return(d.GEO_ID)}).keys()

  // Add X axis
  var x = d3.scaleBand()
      .domain(groups)
      .range([0, stackWidth])
      .padding([0.2])
  svg.append("g")
    .attr("transform", "translate(0," + stackHeight + ")")
    //.call(d3.axisBottom(x).tickSizeOuter(0));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 100])
    .range([ stackHeight, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // color palette = one color per subgroup
  var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['#0000cc','#00ccff','#99ccff','#99ff99','#3399ff','#00ff99','#6600ff'])

  //stack the data --> stack per subgroup
  var stackedData = d3.stack()
    .keys(subgroups)
    (data)
  // Show the bars
  svg.append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .enter().append("g")
      .attr("class", function(d){return d.key})
      .attr("fill", function(d) { return color(d.key); })
      .selectAll("rect")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("class", function(d) {return + d.data.GEO_ID})
        .attr("x", function(d) { return x(d.data.GEO_ID); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width",x.bandwidth())



};
    





    
    
    
    
    
})(); //last line of main.js