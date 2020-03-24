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
var attrArray = ["GEO_ID","NAME","Biden","Buttigieg","Gabbard","Klobuchar","Sanders","Steyer","Warren","White%","Black%","20_54%","55_85+%","UniversityDegree"];

var expressedArray = ["Biden","Buttigieg","Gabbard","Klobuchar","Sanders","Steyer","Warren","White%","Black%","20_54%","55_85+%","UniversityDegree"];
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
        
            //create chart
            setChart(csvData, colorScale);
        
            //create dropdown
            createDropdown(csvData);
        
        
        
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
                return "counties " + d.properties.FIPS;
            })
            .attr("d", path)
            .style("fill", function(d){
            return colorScale(d.properties[expressed]);
            });
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
function setChart(csvData, colorScale){

     
  //create a second svg element to hold the bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");
    
    //create a rectangle for chart background fill
    var chartBackground = chart.append("rect")
        .attr("class", "chartBackground")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);
    
    //set bars for each province
    var bars = chart.selectAll(".bars")
        .data(csvData)
        .enter()
        .append("rect")
        .sort(function(a, b){
            return b[expressed]-a[expressed]
        })
        .attr("class", function(d){
            return "bars " + d.GEO_ID;
        })
        .attr("width", chartInnerWidth / csvData.length - 1)
    
    //call update chart function
    updateChart(bars,csvData.length,colorScale);


    //below Example 2.8...create a text element for the chart title
    var chartTitle = chart.append("text")
        .attr("x", 40)
        .attr("y", 40)
        .attr("class", "chartTitle")
        .text(expressed);
    
    //create vertical axis generator
    var yAxis = d3.axisLeft()
        .scale(yScale)

    //place axis
    var axis = chart.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis);

    //create frame for chart border
    var chartFrame = chart.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);

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
        .style("fill", function(d){
            return colorScale(d.properties[expressed]);
            });
    
    //re-sort, resize, recolor bars
    var bars = d3.selectAll(".bars")
        //re-sort bars
        .sort(function(a,b){
             return b[expressed] - a[expressed];
        })
    
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
    




    
    
    
    
    
})(); //last line of main.js