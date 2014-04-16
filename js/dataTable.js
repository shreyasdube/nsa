function DataTable(vizBody, bounds, title, subtitle, series, valueFuncs, maxItems) {
  // Initialize the parent prototype
  this.base = Plot;
  this.base(vizBody, bounds, title, subtitle);

  // Initialize with provided parameters
  this.series = series;
  this.valueFuncs = valueFuncs;
  this.maxItems = maxItems;

  var that = this;

  // Define functions
  this.draw = function() {
    // load the new data
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
  };

  this.update = function() {
    // we can just reuse the draw function
    that.draw();
  };

  // Finish initialization
  this.selection = 0;

  var table = this.vizBody.append("table");
  table.attr({class: 'dataTable'});

  var thead = table.append("thead");
  this.tbody = table.append("tbody");

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

  this.draw();
}

DataTable.prototype = new Plot;

