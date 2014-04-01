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

  // returns only those data items that match the selected country and network dropdowns
  getFilteredData: function() {
    var country = uiUtil.getSelectedCountry();
    var network = uiUtil.getSelectedNetwork();

    console.log("filter by ", country, network);
    return waf.data.filter(function(d) {
      
      // if both are *, return immediately
      if (country === "*" && network === "*") {
        return true;
      } else {
        // if country is *, then filter by network
        if (country === "*") {
          return d.network === network;
        } else if (network === "*") {
          // filter by country
          return d.country === country;
        } else {
          // filter by both
          return d.country === country && d.network === network;
        }
      }
    });
  },

  init: function(wafData) {
    waf.data = wafData;
  } 
}