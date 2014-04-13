var dataTable = {
  vizBody: null,
  bounds: {},
  valueFuncs: [],
  values: [],
  maxItems: 0,

  init: function(vizBody, bounds, series, valueFuncs, maxItems) {
    dataTable.vizBody = vizBody;
    dataTable.bounds = bounds;
    dataTable.valueFuncs = valueFuncs;

    dataTable.values = dataTable.valueFuncs.map(function (d) {
      return d().map(function(e) {
        return e.slice(0, maxItems);
      });
    });

    dataTable.draw();
  },

  draw: function() {
    var table = dataTable.vizBody.selectAll('.datatable');
  },

  update: function() {
  }
}
