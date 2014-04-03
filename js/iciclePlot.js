// Based upon ideas from http://bl.ocks.org/mbostock/1005873
var iciclePlot = {
  vizBody: null,
  bounds: {},
  rootFunc: null,
  root: {},
  x: null,
  y: null,
  icicles: null,

  init: function(vizBody, bounds, rootFunc) {
    iciclePlot.vizBody = vizBody;
    iciclePlot.bounds = bounds;
    iciclePlot.rootFunc = rootFunc;

    vizBody.append("defs").append("clipPath")
      .attr("id", bounds.clipPath)
      .append("rect")
        .attr("width", bounds.width)
        .attr("height", bounds.height);

    iciclePlot.root = iciclePlot.rootFunc();

    iciclePlot.draw();
  },

  draw: function() {
    var color = d3.scale.category20c();

    iciclePlot.x = d3.scale.linear().range([0, iciclePlot.bounds.width]);
    iciclePlot.y = d3.scale.linear().range([0, iciclePlot.bounds.height]);

    var partition = d3.layout.partition()
      .children(function(d) { return isNaN(d.value) ? d3.entries(d.value) : null; })
      .value(function(d) { return d.value; });

    iciclePlot.icicles = iciclePlot.vizBody.selectAll('.icicle')
        .data(partition(d3.entries(iciclePlot.root)[0]));

    iciclePlot.icicles.enter().append("rect")
      .attr("class", "icicle")
      .attr("x", function(d) { return iciclePlot.x(d.x); })
      .attr("y", function(d) { return iciclePlot.y(d.y); })
      .attr("width", function(d) { return iciclePlot.x(d.dx); })
      .attr("height", function(d) { return iciclePlot.y(d.dy); })
      .attr("fill", function(d) { return color((d.children ? d : d.parent).key); })
      .on("click", iciclePlot.clicked);
  },

  update: function(d) {
    iciclePlot.root = iciclePlot.rootFunc();
    iciclePlot.draw();
  },

  clicked: function(d) {
    iciclePlot.x.domain([d.x, d.x + d.dx]);
    iciclePlot.y.domain([d.y, 1]).range([d.y ? 20 : 0, iciclePlot.bounds.height]);

    iciclePlot.icicles.transition()
      .duration(750)
      .attr("x", function(d) { return iciclePlot.x(d.x); })
      .attr("y", function(d) { return iciclePlot.y(d.y); })
      .attr("width", function(d) { return iciclePlot.x(d.x + d.dx) - iciclePlot.x(d.x); })
      .attr("height", function(d) { return iciclePlot.y(d.y + d.dy) - iciclePlot.y(d.y); });
  }
}
