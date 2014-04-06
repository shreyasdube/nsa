var timeRangeSelector = {
  bb: null,
  g: null, 
  x: d3.scale.linear(),
  y: d3.scale.linear(),

  init: function(gWrapper, bb) {
    timeRangeSelector.bb = bb;
    timeRangeSelector.g  = gWrapper;

    timeRangeSelector.x
      .domain([0, 23])
      .range([0, bb.width]);
    
    timeRangeSelector.y
      .domain([0, 100])
      .rangeRound([bb.height, 0]);

    var xAxis = d3.svg.axis().scale(timeRangeSelector.x).orient("bottom");
    var yAxis = d3.svg.axis().scale(timeRangeSelector.y).orient("left");

    gWrapper.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + bb.height + ")")
      .call(xAxis);

    gWrapper.append("g")
      .attr("class", "y axis")
      // .attr("transform", "translate(" + (bb.left) + "," + (bb.top) + ")")
      .call(yAxis);
  }

}