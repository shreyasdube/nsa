var dataTable = {
  vizBody: null,
  bounds: {},
  valueFuncs: [],
  values: [],
  maxItems: 0,
  selection: 0,
  tbody: null,

  init: function(vizBody, bounds, series, valueFuncs, maxItems) {
    var that = this;
    that.vizBody = vizBody;
    that.bounds = bounds;
    that.valueFuncs = valueFuncs;
    that.maxItems = maxItems;
    that.selection = 0;

    var table = that.vizBody.append("table");
    table.attr({class: 'dataTable'});

    var thead = table.append("thead");
    that.tbody = table.append("tbody");

    if (series.length == 1) {
      // If only one series, no drop-down
      thead.append("th")
        .style("text-align", "left")
        .text(series[0]);
    } else {
      // Create a drop-down with each series name
      var selector = thead.append("th")
        .style("text-align", "left")
        .append("select");

      selector.selectAll("option").data(series)
        .enter().append("option")
        .attr("value", function(d, i) { return i; })
        .text(function(d) { return d; });

      selector.on("change", function() {
        that.selection = this.selectedIndex;
        that.update();
      });
    }

    thead.append("th")
      .style("text-align", "right")
      .text("Count");

    that.draw();
  },

  draw: function() {
    // load the new data
    var that = this
    that.values = that.valueFuncs.map(function (d) {
      return d().slice(0, that.maxItems);
    });

    // create/update table rows
    var tr = that.tbody.selectAll("tr")
      .data(that.values[that.selection]);

    tr.enter().append("tr");
    tr.exit().remove();

    // create/update cells in rows
    var cells = tr.selectAll("td")
      .data(function(d) { return [d.item, numberFormat(d.count)]; });

    cells.enter().append("td")
      .style("color", function(d, i) { return (i == 0) ? 'lightgray' : 'red' })
      .style("text-align", function(d, i) { return (i == 0) ? 'left' : 'right' });

    cells.text(function(d) { return d; });
  },

  update: function() {
    // we can just reuse the draw function
    this.draw();
  }
}
