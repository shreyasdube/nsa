var timeRangeSelector = {
  bb: null,
  g: null, 
  x: d3.scale.linear(),
  y: d3.scale.linear(),

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
    gWrapper.selectAll(".timeAttack")
      .data(data)
      .enter().append("rect")
        .attr("class", "timeAttack")
        .attr("x", function(d, i) { return timeRangeSelector.x(i); })
        .attr("y", function(d) { return timeRangeSelector.y(d); })
        .attr("height", function(d) { return bb.height - timeRangeSelector.y(d); })
        .attr("width", (bb.width / data.length) - 2)
        .style("fill", colorAttack);
  }

}