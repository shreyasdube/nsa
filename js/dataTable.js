var dataTable = {
  vizBody: null,
  bounds: {},
  valueFuncs: [],
  values: [],
  maxItems: 0,
  selection: 0,
  tbody: null,

  init: function(vizBody, bounds, series, valueFuncs, maxItems) {
    dataTable.vizBody = vizBody;
    dataTable.bounds = bounds;
    dataTable.valueFuncs = valueFuncs;
    dataTable.maxItems = maxItems

    var table = dataTable.vizBody.append("table");
    table.attr({class: 'dataTable'});

    var thead = table.append("thead");
    dataTable.tbody = table.append("tbody");

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

      selector.on("change", dataTable.selectSeries);
    }

    thead.append("th")
      .style("text-align", "right")
      .text("Count");

    dataTable.draw();
  },

  selectSeries: function() {
    dataTable.selection = this.selectedIndex;
    dataTable.update();
  },

  draw: function() {
    // load the new data
    dataTable.values = dataTable.valueFuncs.map(function (d) {
      return d().slice(0, dataTable.maxItems);
    });

    // create/update table rows
    var tr = dataTable.tbody.selectAll("tr")
      .data(dataTable.values[dataTable.selection]);

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
    dataTable.draw();
  }
}
