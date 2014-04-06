var timeRangeSelector = {
  bb: null,
  g: null, 
  x: d3.scale.linear(),
  y: d3.scale.linear(),
  yAxis: d3.svg.axis(),
  rects: null,
  brush: null,
  defaultExtent: [0, 24],

  // add brushing; heavily inspired by [5]
  initBrushing: function() {
    
    timeRangeSelector.brush = d3.svg.brush()
      .x(timeRangeSelector.x)
      .extent(timeRangeSelector.defaultExtent);

    // exxtra large resize handles
    var arc = d3.svg.arc()
      .outerRadius(timeRangeSelector.bb.height / 2)
      .startAngle(0)
      .endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });

    // brush elements are drawn here
    var gBrush = timeRangeSelector.g.append("g")
      .attr("class", "brush")
      .call(timeRangeSelector.brush);

    // draw extra large resize handles
    gBrush.selectAll(".resize")
      .append("path")
        .attr("transform", "translate(0," + timeRangeSelector.bb.height / 2 + ")")
        .attr("d", arc);

    gBrush.selectAll("rect")
      .attr("height", timeRangeSelector.bb.height);

    var brushStart = function() {
      console.log("brushstart");
      // todo what does this do?
      timeRangeSelector.g.classed("selecting", true);
    }

    var brushMove = function() {
      console.log("brushmove");
      timeRangeSelector.colorSelectedBars();
    }

    var brushEnd = function() {
      console.log("brushend", timeRangeSelector.getSelectedTimeRange());
      // todo what does this do?
      timeRangeSelector.g.classed("selecting", !d3.event.target.empty());
      // update the UI!
      controller.update();
    }

    // bind event listeners
    timeRangeSelector.brush
      .on("brushstart", brushStart)
      .on("brush", brushMove)
      .on("brushend", brushEnd);

    brushStart();
    brushMove();
  },

  init: function(gWrapper, bb) {
    timeRangeSelector.bb = bb;
    timeRangeSelector.g  = gWrapper;

    var data = waf.getCompleteFilteredDataGroupedHourly();

    timeRangeSelector.x
      .domain([0, data.length])
      .range([0, bb.width]);
    
    timeRangeSelector.y
      .domain([0, d3.max(data)])
      .rangeRound([bb.height, 0]);

    var xAxis = d3.svg.axis()
      .scale(timeRangeSelector.x)
      .orient("bottom");

    timeRangeSelector.yAxis
      .scale(timeRangeSelector.y)
      .orient("left")
      .ticks(4);

    gWrapper.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + bb.height + ")")
      .call(xAxis);

    gWrapper.append("g")
      .attr("class", "y axis")
      .call(timeRangeSelector.yAxis);

    // draw chart
    timeRangeSelector.rects = gWrapper.selectAll(".timeAttack")
      .data(data)
      .enter().append("rect")
        .attr("class", "timeAttack")
        .attr("x", function(d, i) { return timeRangeSelector.x(i); })
        .attr("y", function(d) { return timeRangeSelector.y(d); })
        .attr("height", function(d) { return bb.height - timeRangeSelector.y(d); })
        .attr("width", (bb.width / data.length) - 2)
        .style("fill", colorNoAttack);

    // init brushing
    timeRangeSelector.initBrushing();
  },

  update: function() {
    console.log("update time range!");
    var data = waf.getCompleteFilteredDataGroupedHourly();

    // update y-scale
    timeRangeSelector.y
      .domain([0, d3.max(data)]);

    // update y-axis
    timeRangeSelector.g.select(".y.axis")
      .call(timeRangeSelector.yAxis);

    // update data
    timeRangeSelector.rects
      .data(data);

    timeRangeSelector.rects
      .attr("y", function(d) { return timeRangeSelector.y(d); })
      .attr("height", function(d) { return timeRangeSelector.bb.height - timeRangeSelector.y(d); })
      // .style("fill", "green");
  },

  getSelectedTimeRange: function() {
    if (timeRangeSelector.brush) {
      var extent = timeRangeSelector.brush.extent();
      extent[1] = Math.floor(Math.max(1, extent[1]));
      console.log("extent: " + extent);
      return extent;
    } else {
      return timeRangeSelector.defaultExtent;
    }
  }, 

  colorSelectedBars: function() {
    var s = timeRangeSelector.getSelectedTimeRange();
    timeRangeSelector.rects
      .style("fill", function(d, i) { 
        // color selected rects to show they are selected
        if(s[0] <= i && i <= s[1]) {
          return colorAttack;
        } else {
          // grey out others
          return colorNoAttack;
        }
      });
  }

}