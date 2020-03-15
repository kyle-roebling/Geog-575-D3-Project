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

    Promise.all([
          d3.csv("/data/SouthCarolina_Data.csv"),
          d3.json("/data/SouthCarolina_Counties.json")
        ]).then(function(d) {
            data = d[0];
            counties = topojson.feature(d[1],d[1].objects.SouthCarolina_Counties).features;
            console.log(data);
            console.log(counties);
      
        });


};