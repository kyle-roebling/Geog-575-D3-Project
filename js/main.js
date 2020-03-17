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
            
            //Join the csv file to the geojson file
            //variables for data join
            var attrArray = ["GEO_ID","NAME","Biden","Buttigieg","Gabbard","Klobuchar","Sanders","Steyer","Warren","White%","Black%","20_54%","55_85+%","UniversityDegree"];
        
           
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
        
            
            //add South Carolina Counites to map
            var regions = map.selectAll(".SouthCarolina_Counties")
                .data(counties)
                .enter()
                .append("path")
                .attr("class", function(d){
                    return "counties " + d.properties.FIPS;
                })
                .attr("d", path);
        
        console.log(counties);

        });

    

};