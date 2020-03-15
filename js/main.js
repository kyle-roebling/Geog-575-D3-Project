/*
Geography 575 D3 Project
Author: Kyle Roebling
Date: 3/14/2020
Description: This map looks at the South Carolina Democratic Primary (2020). It looks at the 
percentage of vote for Biden,Buttigieg,Gabbard,Klobuchar,Sanders,Steyer and Warren along with the 
demographics of race,age,income and education to discover insights on the profiles of candiates support
base.
*/

//begin script when window loads
window.onload = setMap();



//set up choropleth map
function setMap(){
    
    //map frame dimensions
    var width = 960,
        height = 460;
    
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
        .scale(5000)
        .translate([width / 2, height / 2]);
    
    // create projection path generator
    var path = d3.geoPath()
        .projection(projection);
    
    
    // Download csv dataset and json counties for South Carolina
    Promise.all([
          d3.csv("/data/SouthCarolina_Data.csv"),
          d3.json("/data/SouthCarolina_Counties.json")
        ]).then(function(data) {
            dataset = data[0];
            //Convert topojson into geojson format
            counties = topojson.feature(data[1],data[1].objects.SouthCarolina_Counties).features;
            console.log(dataset);
            console.log(counties);
        
            //add South Carolina Counites to map
            var regions = map.selectAll(".SouthCarolina_Counties")
                .data(counties)
                .enter()
                .append("path")
                .attr("class", function(d){
                    return "counties " + d.properties.FIPS;
                })
                .attr("d", path);

        });


};