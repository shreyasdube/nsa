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
    var radiusNoData = 3;
    var data = waf.getAggregatedMapData();

    // create linear scale for the radius
    var rScale = d3.scale.sqrt()
      .domain(d3.extent(data, function(d) { return d.count; }))
      .range([radiusNoData + 2, 32]);

    // reset
    // bubbleMap.g.selectAll(".mapAttack").classed("mapAttackDisabled", true);
    // bubbleMap.g.selectAll(".mapAttack").remove();

    // use object constancy to preserve data bindings
    // see [1]
    var selection = bubbleMap.g.selectAll(".mapAttack")
      // some cities can have the same name, so I am concat'ing it with the latitude
      // to create a unique key
      .data(data, function(d) { return d.id; });
      // .data(data);

    // new circles
    selection.enter().append("circle")
        .attr("class", "mapAttack")
        // use projection to figure out cx and cy
        .attr("cx", function(d, i) { return bubbleMap.latLngToXY(d)[0]; })
        .attr("cy", function(d, i) { return bubbleMap.latLngToXY(d)[1]; })
        .attr("r", function(d) { return rScale(d.count); })
        .style("fill", colorAttack)
        // show tooltip
        .on("mouseover", function(d, i) {
          showTooltip(d, true);
        })
        // hide tooltip
        .on("mouseout", function(d, i) {
          hideTooltip(d);
        });

    // updated circles
    selection
      .transition()
      .duration(transitionDuration)
        .attr("r", function(d) { return rScale(d.count); })
        .style("fill", colorAttack);

    // exiting circles
    selection.exit()
      // show updated tooltip
      .on("mouseover", function(d, i) {
        showTooltip(d, false);
      })
      // hide tooltip
      .on("mouseout", function(d, i) {
        hideTooltip(d);
      })
      .transition()
      .duration(transitionDuration)
        .attr("r", radiusNoData)
        .style("fill", colorNoAttack)
      

    var showTooltip = function(d, showCount) {
      bubbleMap.tooltip.transition()
        .duration(200)
        .style("opacity", 0.9)

      // city name and count
      var html = d.city + ": <b>" 
        + (showCount ? numberFormat(d.count) : "-") 
        + "</b>";
      bubbleMap.tooltip.html(html)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) + "px");
    }

    var hideTooltip = function(d) {
      bubbleMap.tooltip.transition()
        .duration(200)
        .style("opacity", 0);
    }
  },

  init: function(gWrapper, bbMap, world) {
    bubbleMap.bb = bbMap;
    // this will clip paths and points that lie outside the drawable area
    // thanks to [1]
    gWrapper.append("defs")
      .append("clipPath")
        .attr("id", "bubbleMapClipper")
        .append("rect")
          .attr("width", bbMap.width)
          .attr("height", bbMap.height);

    var mapOverlay = gWrapper.append("rect")
        .attr("class", "mapOverlay")
        // .attr("transform", "translate(" + bbMap.left + "," + bbMap.top + ")")
        .attr("width", bbMap.width)
        .attr("height", bbMap.height)

    bubbleMap.g = gWrapper.append("g");

    // tooltip div element
    bubbleMap.tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // projection used
    bubbleMap.projection = d3.geo.mercator()
      .translate([bbMap.width / 2, bbMap.height / 1.8])
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

    mapOverlay.call(zoom);
  }
}
