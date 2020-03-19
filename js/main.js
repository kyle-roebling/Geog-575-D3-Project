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
            
            counties = joinData(data);
        
            //create the color scale
            var colorScale = makeColorScale(data[0]);
        
            addCounties(counties,map,path,colorScale);
    
        
        console.log(counties);

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
    
//Function to create the color scale for the choropleth

function makeColorScale(data){
    var colorClasses = [
        "#D4B9DA",
        "#C994C7",
        "#DF65B0",
        "#DD1C77",
        "#980043"
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
    
    
    
    
    
})(); //last line of main.js