var dataTable = {
  vizBody: null,
  bounds: {},
  valueFuncs: [],
  values: [],
  maxItems: 0,
  selection: 0,
  table: null,
  thead: null,
  tbody: null,

  init: function(vizBody, bounds, series, valueFuncs, maxItems) {
    dataTable.vizBody = vizBody;
    dataTable.bounds = bounds;
    dataTable.valueFuncs = valueFuncs;
    dataTable.maxItems = maxItems

    dataTable.values = dataTable.valueFuncs.map(function (d) {
      return d().slice(0, dataTable.maxItems);
    });

    dataTable.table = dataTable.vizBody.append("table");
    dataTable.thead = dataTable.table.append("thead");
    dataTable.tbody = dataTable.table.append("tbody");

    dataTable.selector = dataTable.thead.append("th").append("select");
    dataTable.thead.append("th").text("Count");

    dataTable.selector.selectAll("option").data(series)
      .enter().append("option")
      .attr("value", function(d, i) { return i; })
      .text(function(d) { return d; });

    dataTable.selector
      .on("change", dataTable.selectSeries);

    dataTable.draw();
  },

  selectSeries: function() {
    dataTable.selection = this.selectedIndex;
    dataTable.update();
  },

  draw: function() {
    var tr = dataTable.tbody.selectAll("tr")
      .data(dataTable.values[dataTable.selection])
      .enter().append("tr");

    tr.selectAll("td")
      .data(function(d) { return [d.item, d.count]; })
      .enter().append("td")
        .text(function(d) { return d; })
        .style("color", function(d, i) { return (i == 0) ? 'lightgray' : 'red' })
        .style("text-align", function(d, i) { return (i == 0) ? 'left' : 'right' }); 
  },

  update: function() {
    dataTable.values = dataTable.valueFuncs.map(function (d) {
      return d().slice(0, dataTable.maxItems);
    });

    var tr = dataTable.tbody.selectAll("tr")
      .data(dataTable.values[dataTable.selection]);

    tr.selectAll("td")
      .data(function(d) { return [d.item, d.count]; })
      .transition().duration(transitionDuration)
      .text(function(d) { return d; })
      .style("color", function(d, i) { return (i == 0) ? 'lightgray' : 'red' })
      .style("text-align", function(d, i) { return (i == 0) ? 'left' : 'right' }); 
  }
}
