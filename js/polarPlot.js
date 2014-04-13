// Based upon ideas from http://bl.ocks.org/jeffthink/1630683
var polarPlot = {
  vizBody: null,
  bounds: {},
  categories: [],
  valueFuncs: [],
  values: [],
  color: null,
  maxVal: 0,
  maxRadius: 0,
  radius: null,

  init: function(vizBody, bounds, categories, valueFuncs, color) {
    polarPlot.vizBody = vizBody;
    polarPlot.bounds = bounds;
    polarPlot.categories = categories;
    polarPlot.valueFuncs = valueFuncs;
    polarPlot.color = d3.scale.ordinal().domain(color.length).range(color);

    polarPlot.values = polarPlot.valueFuncs.map(function (d) {
      // concat the first value to the end to close the circle
      return d().concat(d()[0]);
    });

    polarPlot.setScales();
    polarPlot.addAxes();
    polarPlot.draw();
  },

  setScales: function() {
    var vizPadding = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    };

    var heightCircleConstraint = polarPlot.bounds.height - vizPadding.top - vizPadding.bottom;
    var widthCircleConstraint = polarPlot.bounds.width - vizPadding.left - vizPadding.right;
    polarPlot.maxRadius = d3.min([heightCircleConstraint, widthCircleConstraint]) / 2;

    var centerX = widthCircleConstraint / 2 + vizPadding.left;
    var centerY = heightCircleConstraint / 2 + vizPadding.top;

    polarPlot.maxVal = d3.max(polarPlot.flatten(polarPlot.values));
    polarPlot.radius = d3.scale.linear().domain([0, polarPlot.maxVal])
      .range([0, polarPlot.maxRadius]);

    polarPlot.vizBody.attr("transform",
      "translate(" + centerX + ", " + centerY + ")");
  },

  addAxes: function() {
    var radialTicks = polarPlot.radius.ticks(5);

    polarPlot.vizBody.selectAll('.circle-ticks').remove();
    polarPlot.vizBody.selectAll('.line-ticks').remove();

    var circleAxes = polarPlot.vizBody.selectAll('.circle-ticks')
      .data(radialTicks)
      .enter().append('svg:g')
      .attr("class", "circle-ticks");

    circleAxes.append("svg:circle")
      .attr("r", function (d, i) {
        return polarPlot.radius(d);
      })
      .attr("class", "circle-axis");

    circleAxes.append("svg:text")
      .attr("text-anchor", "middle")
      .attr("dy", function (d) {
        return -1 * polarPlot.radius(d);
      })
      .text(String);

    var lineAxes = polarPlot.vizBody.selectAll('.line-ticks')
      .data(polarPlot.categories)
      .enter().append('svg:g')
      .attr("transform", function (d, i) {
        return "rotate(" + ((i / polarPlot.categories.length * 360) - 90) +
          ")translate(" + polarPlot.radius(polarPlot.maxVal) + ")";
      })
      .attr("class", "line-ticks");

    lineAxes.append('svg:line')
      .attr("x2", -1 * polarPlot.radius(polarPlot.maxVal))
      .attr("class", "line-axis");

    lineAxes.append('svg:text')
      .text(String)
      .attr("text-anchor", "middle")
      .attr("transform", function (d, i) {
        return (i / polarPlot.categories.length * 360) < 180 ? null : "rotate(180)";
      });
  },

  draw: function() {
    var lines = polarPlot.vizBody.selectAll('.line')
      .data(polarPlot.values);

    lines.enter().append('svg:path')
      .attr("class", "line")
      .attr("d", d3.svg.line.radial()
        .radius(function (d) { return 0; })
        .angle(function (d, i) {
          i = i % polarPlot.categories.length; // wrap back around
          return (i / polarPlot.categories.length) * 2 * Math.PI;
        })
      )
      .style('stroke', function (d, i) { return polarPlot.color(i); })
      .style("fill", "none");

    lines.transition()
      .duration(transitionDuration)
      .attr("d", d3.svg.line.radial()
        .radius(function (d) { return polarPlot.radius(d); })
        .angle(function (d, i) {
          i = i % polarPlot.categories.length; // wrap back around
          return (i / polarPlot.categories.length) * 2 * Math.PI;
      })
    );
  },

  update: function() {
    polarPlot.values = polarPlot.valueFuncs.map(function (d) {
      return d().concat(d()[0]);
    });
    polarPlot.maxVal = d3.max(polarPlot.flatten(polarPlot.values));
    polarPlot.radius = d3.scale.linear().domain([0, polarPlot.maxVal])
      .range([0, polarPlot.maxRadius]);

    polarPlot.addAxes();

    return polarPlot.draw();
  },

  flatten: function(values) {
    return values.reduce(function(prev, curr) {
      return prev.concat(curr);
    },[]);
  }
};

