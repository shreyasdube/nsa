var uiUtil = {

  countrySelectorId: null,
  networkSelectorId: null,

  initCountrySelector: function(countrySelectorId) {
    uiUtil.countrySelectorId = countrySelectorId;

    // get all countries in sorted order
    var countries = countryCodes.getSortedCountries();

    // create manual entry for the entire world
    var world = {
      iso2Code: "*",
      geoJsonCode: "*",
      name: "World"
    }

    var select = d3.select(countrySelectorId).append("select");

    // concat world + countries
    select
      .selectAll("option").data([world].concat(countries))
      .enter().append("option")
      .attr("value", function(d) { return d.iso2Code; })
      .text(function(d) { return d.name; });

    return select;
  }, 

  // gets selected country
  getSelectedCountry: function() {
    return d3.select(uiUtil.countrySelectorId + " > select").node().value; 
  },

  initNetworkSelector: function(networkSelectorId) {
    uiUtil.networkSelectorId = networkSelectorId;

    // get all networks in sorted order
    var networks = waf.getNetworks();

    var select = d3.select(networkSelectorId).append("select");

    select
      .selectAll("option").data(["*"].concat(networks))
      .enter().append("option")
      .attr("value", function(d) { return d; })
      .text(function(d) { return d; });

    return select;
  },

  // gets selected network
  getSelectedNetwork: function() {
    return d3.select(uiUtil.networkSelectorId + " > select").node().value; 
  }

}

var bubbleMap = {
  bb: null,
  g: null,
  projection: null,
  path: null,
  tooltip: null, 
  // converts lon, lat to x and y using a d3 projection
  latLngToXY: function(d) {
    return bubbleMap.projection([parseFloat(d.lng), parseFloat(d.lat)]);
  },

  update: function() {
    var data = waf.getAggregatedMapData();

    // create linear scale for the radius
    var rScale = d3.scale.sqrt()
      .domain(d3.extent(data, function(d) { return d.count; }))
      .range([4, 32]);

    // reset
    bubbleMap.g.selectAll(".mapAttack").remove();

    bubbleMap.g.selectAll(".mapAttack")
      .data(data)
      .enter().append("circle")
        .attr("class", "mapAttack")
        // use projection to figure out cx and cy
        .attr("cx", function(d, i) { return bubbleMap.latLngToXY(d)[0]; })
        .attr("cy", function(d, i) { return bubbleMap.latLngToXY(d)[1]; })
        .attr("r", function(d) { return rScale(d.count); })
        // show tooltip
        .on("mouseover", function(d, i) {
          bubbleMap.tooltip.transition()   
            .duration(200)      
            .style("opacity", 0.9)

          // city name and count
          var html = d.city + ": <b>" + numberFormat(d.count) + "</b>";
          bubbleMap.tooltip.html(html)  
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY) + "px"); 
        })
        // hide tooltip
        .on("mouseout", function(d, i) {
          bubbleMap.tooltip.transition()        
            .duration(200)      
            .style("opacity", 0); 
        });
  }, 

  init: function(gWrapper, bbMap, world) {
    bubbleMap.bb = bbMap;

    bubbleMap.g = gWrapper.append("g");
    /*var mapOverlay = gWrapper.append("rect")
        .attr("class", "mapOverlay")
        // .attr("transform", "translate(" + bbMap.left + "," + bbMap.top + ")")
        .attr("width", bbMap.width)
        .attr("height", bbMap.height)*/

    // tooltip div element
    bubbleMap.tooltip = d3.select("body").append("div")   
      .attr("class", "tooltip")               
      .style("opacity", 0);

    // projection used
    bubbleMap.projection = d3.geo.equirectangular()
      .translate([bbMap.width / 2, bbMap.height / 2])
      .scale(140);
    // path used to draw the world map
    bubbleMap.path = d3.geo.path().projection(bubbleMap.projection);

    var zoom = d3.behavior.zoom()
        // .translate([0, 0])
        // .scale(1)
        .scaleExtent([1, 8])
        .on("zoom", function() {
          bubbleMap.g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        });

    bubbleMap.g.selectAll("path")
        .data(world.features)
        .enter().append("path")
          .attr("class", "country")
          .attr("d", bubbleMap.path);

    // mapOverlay.call(zoom);
  }
}
