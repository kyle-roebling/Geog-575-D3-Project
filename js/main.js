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

    //use queue to parallelize asynchronous data loading
    d3.queue()
        .defer(d3.csv, "data/SouthCarolina_Data.csv") //load attributes from csv
        //.defer(d3.json, "data/SouthCarolina_Counties.topojson") //load choropleth spatial data
        .await(callback);


};

