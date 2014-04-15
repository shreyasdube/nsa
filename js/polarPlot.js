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
    var that = this;
    that.vizBody = vizBody;
    that.bounds = bounds;
    that.categories = categories;
    that.valueFuncs = valueFuncs;
    that.color = d3.scale.ordinal().domain(color.length).range(color);

    that.values = that.valueFuncs.map(function (d) {
      // concat the first value to the end to close the circle
      return d().concat(d()[0]);
    });

    that.setScales();
    that.addAxes();
    that.draw();
  },

  setScales: function() {
    var vizPadding = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    };

    var that = this;
    var heightCircleConstraint = that.bounds.height - vizPadding.top - vizPadding.bottom;
    var widthCircleConstraint = that.bounds.width - vizPadding.left - vizPadding.right;
    that.maxRadius = d3.min([heightCircleConstraint, widthCircleConstraint]) / 2;

    var centerX = widthCircleConstraint / 2 + vizPadding.left;
    var centerY = heightCircleConstraint / 2 + vizPadding.top;

    that.maxVal = d3.max(that.flatten(that.values));
    that.radius = d3.scale.linear().domain([0, that.maxVal])
      .range([0, that.maxRadius]);

    that.vizBody.attr("transform",
      "translate(" + centerX + ", " + centerY + ")");
  },

  addAxes: function() {
    var that = this;

    var radialTicks = that.radius.ticks(5);

    that.vizBody.selectAll('.circle-ticks').remove();
    that.vizBody.selectAll('.line-ticks').remove();

    var circleAxes = that.vizBody.selectAll('.circle-ticks')
      .data(radialTicks)
      .enter().append('svg:g')
      .attr("class", "circle-ticks");

    circleAxes.append("svg:circle")
      .attr("r", function (d, i) {
        return that.radius(d);
      })
      .attr("class", "circle-axis");

    circleAxes.append("svg:text")
      .attr("text-anchor", "middle")
      .attr("dy", function (d) {
        return -1 * that.radius(d);
      })
      .text(String);

    var lineAxes = that.vizBody.selectAll('.line-ticks')
      .data(that.categories)
      .enter().append('svg:g')
      .attr("transform", function (d, i) {
        return "rotate(" + ((i / that.categories.length * 360) - 90) +
          ")translate(" + that.radius(that.maxVal) + ")";
      })
      .attr("class", "line-ticks");

    lineAxes.append('svg:line')
      .attr("x2", -1 * that.radius(that.maxVal))
      .attr("class", "line-axis");

    lineAxes.append('svg:text')
      .text(String)
      .attr("text-anchor", "middle")
      .attr("transform", function (d, i) {
        return (i / that.categories.length * 360) < 180 ? null : "rotate(180)";
      });
  },

  draw: function() {
    var that = this;

    var lines = that.vizBody.selectAll('.line')
      .data(that.values);

    lines.enter().append('svg:path')
      .attr("class", "line")
      .attr("d", d3.svg.line.radial()
        .radius(function (d) { return 0; })
        .angle(function (d, i) {
          i = i % that.categories.length; // wrap back around
          return (i / that.categories.length) * 2 * Math.PI;
        })
      )
      .style('stroke', function (d, i) { return that.color(i); })
      .style("fill", "none");

    lines.transition()
      .duration(transitionDuration)
      .attr("d", d3.svg.line.radial()
        .radius(function (d) { return that.radius(d); })
        .angle(function (d, i) {
          i = i % that.categories.length; // wrap back around
          return (i / that.categories.length) * 2 * Math.PI;
      })
    );
  },

  update: function() {
    var that = this;

    that.values = that.valueFuncs.map(function (d) {
      return d().concat(d()[0]);
    });
    that.maxVal = d3.max(that.flatten(that.values));
    that.radius = d3.scale.linear().domain([0, that.maxVal])
      .range([0, that.maxRadius]);

    that.addAxes();

    return that.draw();
  },

  flatten: function(values) {
    return values.reduce(function(prev, curr) {
      return prev.concat(curr);
    },[]);
  }
};

