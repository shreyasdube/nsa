var timeRangeSelector = {
  bb: null,
  g: null, 
  x: d3.scale.linear(),
  y: d3.scale.linear(),
  rects: null,

  // add brushing; heavily inspired by [5]
  initBrushing: function() {
    
    var brush = d3.svg.brush()
      .x(timeRangeSelector.x)
      .extent([0, .5]);

    // exxtra large resize handles
    var arc = d3.svg.arc()
      .outerRadius(timeRangeSelector.bb.height / 2)
      .startAngle(0)
      .endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });

    // brush elements are drawn here
    var gBrush = timeRangeSelector.g.append("g")
      .attr("class", "brush")
      .call(brush);

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
      var s = brush.extent();
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

    var brushEnd = function() {
      console.log("brushend", brush.extent());
      // todo what does this do?
      timeRangeSelector.g.classed("selecting", !d3.event.target.empty());
    }

    // bind event listeners
    brush
      .on("brushstart", brushStart)
      .on("brush", brushMove)
      .on("brushend", brushEnd);

    brushStart();
    brushMove();
  },

  init: function(gWrapper, bb) {
    timeRangeSelector.bb = bb;
    timeRangeSelector.g  = gWrapper;

    var data = waf.getFilteredDataGroupedHourly();

    timeRangeSelector.x
      .domain([0, data.length])
      .range([0, bb.width]);
    
    timeRangeSelector.y
      .domain([0, d3.max(data)])
      .rangeRound([bb.height, 0]);

    var xAxis = d3.svg.axis()
      .scale(timeRangeSelector.x)
      .orient("bottom");

    var yAxis = d3.svg.axis()
      .scale(timeRangeSelector.y)
      .orient("left")
      .ticks(4);

    gWrapper.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + bb.height + ")")
      .call(xAxis);

    gWrapper.append("g")
      .attr("class", "y axis")
      .call(yAxis);

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
  }

}