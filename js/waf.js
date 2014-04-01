var waf = {
  data: null,

  getNetworks: function() {
    // get all unique networks
    var networks = {};
    waf.data.forEach(function(d) {
      networks[d.network] = true;
    });

    // convert to array
    var networksArray = [];
    for (var network in networks) {
      networksArray.push(network);
    }

    // finally, sort the array
    return networksArray.sort(function(a, b) {
      return d3.ascending(a, b);
    });
  },

  init: function(wafData) {
    waf.data = wafData;
  } 
}