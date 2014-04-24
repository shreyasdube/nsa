var bubbleMap = {
  bb: null,
  g: null,
  projection: null,
  path: null,
  mapOverlay: null,
  zoom: null,
  tooltip: null,
  // converts lon, lat to x and y using a d3 projection
  latLngToXY: function(d) {
    return bubbleMap.projection([parseFloat(d.lng), parseFloat(d.lat)]);
  },

  createTooltip: function(city, showCount) {
    // reset
    bubbleMap.tooltip.html("");

    // city name and count
    var html = city.city + ": <b>" 
      + (showCount ? numberFormat(city.count) : "-") 
      + "</b>";
    bubbleMap.tooltip.append("div")
      .html(html);

    if (!showCount) {
      return;
    }

    // get detailed data for city
    var cityData = waf.getDataForCity(city);
    var hourlyData = cityData.hourlyComplete;
    // this will tell us the selected time window
    var extent = timeRangeSelector.getSelectedTimeRange();

    // bounding box for tooltip viz
    var bb = {};
    bb.margin = {
      top: 10, 
      right: 40, 
      bottom: 20, 
      left: 60
    };
    bb.height = 100 - bb.margin.top - bb.margin.bottom;
    bb.width = 400 - bb.margin.left - bb.margin.right;

    // parent <g> element
    var g = bubbleMap.tooltip
      .append("svg")
        .attr({
          width: bb.width + bb.margin.left + bb.margin.right, 
          height: bb.height + bb.margin.top + bb.margin.bottom
        })
      .append("g")
        .attr({
          class: "tooltipTimeRangeWrapper",
          transform: "translate(" + bb.margin.left + "," + bb.margin.top  + ")"
        });

    // x scale
    var x = d3.scale.linear()
      .domain([0, hourlyData.length])
      .range([0, bb.width]);

    // y scale
    var y = d3.scale.linear()
      .domain([0, d3.max(hourlyData)])
      .rangeRound([bb.height, 0]);

    // x axis
    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    // y axis
    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(4);

    // draw x axis
    g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + bb.height + ")")
      .call(xAxis);

    // draw y axis
    g.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    g.selectAll(".timeAttack")
      .data(hourlyData)
      .enter().append("rect")
        .attr("x", function(d, i) { return x(i); })
        .attr("y", function(d) { return y(d); })
        .attr("height", function(d) { return bb.height - y(d); })
        .attr("width", (bb.width / hourlyData.length) - 2)
        .attr("class", function(d, i) {
          // use color for attacks if this hour is within the selected time range
          if (i >= extent[0] && i < extent[1]) {
            return "timeAttack";
          } else {
            // otherwise grey out
            return "timeAttack noAttack";
          }
        });
  }, 

  zoomToFit: function() {
    var autoZoomMargin = 40;  // includes both sides

    // figure out what should be visible
    var visibleRangeLatLng = waf.visibleRange();
    var visibleRangeXY = [
      bubbleMap.latLngToXY(visibleRangeLatLng[0]),
      bubbleMap.latLngToXY(visibleRangeLatLng[1]),
    ];

    // get the dimensions, including a margin
    var viewDimensions = {
      width: autoZoomMargin + visibleRangeXY[1][0] - visibleRangeXY[0][0],
      height: autoZoomMargin + visibleRangeXY[1][1] - visibleRangeXY[0][1]
    };

    // calculate the appropriate scaling factor
    var xScale = bubbleMap.bb.width / viewDimensions.width;
    var yScale = bubbleMap.bb.height / viewDimensions.height;
    var scale = d3.min([xScale, yScale]);

    // determine the view size with the proper aspect ratio
    var scaledDimensions = {
      height: bubbleMap.bb.height / scale,
      width: bubbleMap.bb.width / scale
    };

    // determine the upper-left of that view in the unscaled world
    var upperLeft = {
      left: (visibleRangeXY[0][0] + visibleRangeXY[1][0] - scaledDimensions.width) / 2,
      top: (visibleRangeXY[0][1] + visibleRangeXY[1][1] - scaledDimensions.height) / 2
    };

    // store the scaled translation to move that point to the righe place
    var translate = [-upperLeft.left * scale, -upperLeft.top * scale];

    // update the view
    bubbleMap.g.attr("transform", "translate(" + translate + ")scale(" + scale + ")");

    // update the zooming behavior
    bubbleMap.zoom = d3.behavior.zoom()
      .scale(scale)
      .translate(translate)
      .scaleExtent([1, 24])
      .on("zoom", function() {
        bubbleMap.g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      });
    bubbleMap.mapOverlay.call(bubbleMap.zoom);
  },

  update: function() {
    bubbleMap.zoomToFit();

    var radiusNoData = .5;
    var data = waf.getAggregatedMapData();

    // create linear scale for the radius
    var rScale = d3.scale.sqrt()
      .domain(d3.extent(data, function(d) { return d.count; }))
      .range([radiusNoData, 20]);

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
        // show tooltip
        .on("mouseover", function(d, i) {
          hoverOver(d.id);
          showTooltip(d, d.count > 0);
        })
        // hide tooltip
        .on("mouseout", function(d, i) {
          hoverOut();
          hideTooltip(d);
        });

    // updated circles
    selection
      // show updated tooltip
      .on("mouseover", function(d, i) {
        // this.style.strokeWidth = "2px";
        hoverOver(d.id);
        showTooltip(d, d.count > 0);
      })
      .on("mouseout", function(d, i) {
        // this.style.strokeWidth = "0px";
        hoverOut();
        hideTooltip(d);
      })
      .transition()
      .duration(transitionDuration)
        .attr("r", function(d) { return rScale(d.count); })
        .attr("class", function(d) { return 'mapAttack ' + (d.count ? '' : 'noAttack'); });

    selection.order();

    var showTooltip = function(d, showCount) {
      bubbleMap.tooltip.transition()
        .duration(200)
        .style("opacity", 0.9)

      bubbleMap.createTooltip(d, showCount);
      
      bubbleMap.tooltip
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) + "px");
    }

    var hideTooltip = function(d) {
      bubbleMap.tooltip.transition()
        .duration(200)
        .style("opacity", 0);
    }

    var hoverOver = function(cityId) {
      bubbleMap.g.selectAll(".mapAttack")
        .classed("hideAttack", function(d) {
          return d.id !== cityId;
        });
    }

    var hoverOut = function() {
      bubbleMap.g.selectAll(".mapAttack")
        .classed("hideAttack", false);
    }
  },

  init: function(gWrapper, bbMap, world) {
    bubbleMap.bb = bbMap;
    // this will clip paths and points that lie outside the drawable area
    // thanks to [1]
    var defs = gWrapper.append("defs");

    defs.append("clipPath")
      .attr("id", "bubbleMapClipper")
      .append("rect")
        .attr("width", bbMap.width)
        .attr("height", bbMap.height);

    // Add a pattern for use by 0 attack nodes
    // http://www.carto.net/svg/samples/patterns.shtml
    var pattern = defs.append("pattern")
      .attr({
        id: "crossHatch",
        patternUnits: "userSpaceOnUse",
        x: "0",
        y: "0",
        width: "1",
        height: "1"
      })
      .append("g")
        .style({
          fill: "none",
          stroke: "black",
          "stroke-width": "0.3"
        });
    pattern.append("path")
      .attr("d", "M0,0l1,1");
    pattern.append("path")
      .attr("d", "M1,0l-1,1");

    bubbleMap.mapOverlay = gWrapper.append("rect")
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
      .translate([bbMap.width / 2, bbMap.height / 1.75])
      .scale(140);
    // path used to draw the world map
    bubbleMap.path = d3.geo.path().projection(bubbleMap.projection);

    bubbleMap.zoom = d3.behavior.zoom()
        // .translate([0, 0])
        // .scale(1)
        .scaleExtent([1, 24])
        .on("zoom", function() {
          bubbleMap.g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        });

    bubbleMap.g.selectAll("path")
        .data(world.features)
        .enter().append("path")
          .attr("class", "country")
          .attr("d", bubbleMap.path);

    bubbleMap.mapOverlay.call(bubbleMap.zoom);
  }
}
