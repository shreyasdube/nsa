// Based upon ideas from http://bl.ocks.org/jeffthink/1630683
var polarPlot = {
  vizBody: null,
  bounds: {},
  categories: [],
  valueFuncs: [],
  values: [],
  maxVal: 0,
  maxRadius: 0,
  radius: null,

  init: function(vizBody, bounds, categories, valueFuncs) {
    polarPlot.vizBody = vizBody;
    polarPlot.bounds = bounds;
    polarPlot.categories = categories;
    polarPlot.valueFuncs = valueFuncs;

    polarPlot.values = polarPlot.valueFuncs.map(function (d) {
      return d();
    });

    polarPlot.setScales();
    polarPlot.addAxes();
    polarPlot.draw();
  },

  setScales: function() {
    var vizPadding = {
      top: 14,
      right: 0,
      bottom: 0,
      left: 0
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
    var color = d3.scale.category10();

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
      .style('stroke', function (d, i) { return color(i); })
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
      return d();
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

