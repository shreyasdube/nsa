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

  getAggregatedMapData: function() {
    var filteredData = waf.getFilteredData();

    // aggregate by city, drop all other dimensions
    var cities = {};
    filteredData.forEach(function(d) {
      var city = d.city;
      // city already exists, just add the total count
      if (cities[city]) {
        cities[city].count += d.count;
      } else {
        // create new city
        cities[city] = {
          city: city, 
          lat: d.lat,
          lng: d.lng, 
          count: d.count
        }
      }
    });

    // convert to array
    var citiesArray = [];
    for (var city in cities) {
      citiesArray.push(cities[city]);
    }
    return citiesArray;
  }, 

  init: function(wafData) {
    waf.data = wafData;
  } 
}