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
  // not meant for direct use
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

  getFilteredDataGroupedHourly: function() {
    var hourBuckets = d3.range(24).map(function() { return 0; });

    // bucket counts based upon hour of the day
    waf.getFilteredData().forEach(function(d) {
      hourBuckets[d.date.getHours()] += d.count;
    });

    return hourBuckets;
  },

  getAggregatedMapData: function() {
    var filteredData = waf.getFilteredData();

    // aggregate by city, drop all other dimensions
    var cities = {};
    filteredData.forEach(function(d) {
      var city = d.city;
      // city already exists, just add the total count
      if (cities[city]) {
        cities[city].count += +d.count;
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

    // sort array in DESC order
    citiesArray.sort(function(a, b) {
      return d3.descending(a.count, b.count);
    });

    return citiesArray;
  },

  init: function(wafData) {
    waf.data = wafData.map(function(d) {
      // convert numbers and dates
      d.count = +d.count;
      d.lat   = +d.lat;
      d.lng   = +d.lng;
      d.date  = new Date(+d.timestamp * 1000);
      return d;
    });
  }
}
