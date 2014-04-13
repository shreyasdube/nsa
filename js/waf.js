var waf = {
  data: null,
  filteredData: null,

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
  filterByCountryAndNetwork: function() {
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

  refreshFilteredData: function() {
    var extent  = timeRangeSelector.getSelectedTimeRange();
    console.log("filter by extent", extent);

    waf.filteredData = waf.filterByCountryAndNetwork().filter(function(d) {
      // check if data falls within time range
      return (d.hour >= extent[0] && d.hour < extent[1]);
    });
  },

  getFilteredHourlyMean: function() {
    var mean = d3.mean(waf.getFilteredDataGroupedHourly());
    return d3.range(24).map(function() { return mean; });
  },

  getFilteredDataGroupedHourly: function() {
    var hourBuckets = d3.range(24).map(function() { return 0; });

    // bucket counts based upon hour of the day
    waf.filteredData.forEach(function(d) {
      hourBuckets[d.hour] += d.count;
    });

    return hourBuckets.concat(hourBuckets[0]);
  },

  // this is used by the time range selector only
  getCompleteFilteredDataGroupedHourly: function() {
    var hourBuckets = d3.range(24).map(function() { return 0; });

    // bucket counts based upon hour of the day
    waf.filterByCountryAndNetwork().forEach(function(d) {
      hourBuckets[d.hour] += d.count;
    });

    return hourBuckets;
  },

  getFilteredHierarchy: function() {
    var root = {Attacks: {}}

    waf.filteredData.forEach(function(d) {
      if (root['Attacks'][d.country] == null) root['Attacks'][d.country] = {};
      if (root['Attacks'][d.country][d.state] == null) root['Attacks'][d.country][d.state] = {};
      if (root['Attacks'][d.country][d.state][d.city] == null) {
        root['Attacks'][d.country][d.state][d.city] = d.count;
      } else {
        root['Attacks'][d.country][d.state][d.city] += d.count;
      }
    });

    return root;
  },

  getAggregatedMapData: function() {
    // aggregate by city, drop all other dimensions
    var cities = {};
    waf.filteredData.forEach(function(d) {
      var cityId = d.country + "-" + d.state + "-" + d.city;
      // city already exists, just add the total count
      if (cities[cityId]) {
        cities[cityId].count += d.count;
      } else {
        // create new city
        cities[cityId] = {
          id: cityId,
          city: d.city,
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

  getNumberOfAttacks: function() {
    var count = 0;

    waf.filteredData.forEach(function(d) {
      count += d.count;
    });

    return count;
  },

  getTopBrowsers: function() {
    counts = {};

    waf.filteredData.forEach(function(d) {
      if (counts[d.browser]) {
        counts[d.browser] += d.count;
      } else {
        counts[d.browser] = d.count;
      }
    });

    return waf.descCountsHash(counts);
  },

  getTopOperatingSystems: function () {
    counts = {};

    waf.filteredData.forEach(function(d) {
      if (counts[d.os]) {
        counts[d.os] += d.count;
      } else {
        counts[d.os] = d.count;
      }
    });

    return waf.descCountsHash(counts);
  },

  getTopCountries: function (){
    counts = {};

    waf.filteredData.forEach(function(d) {
      if (counts[d.country]) {
        counts[d.country] += d.count;
      } else {
        counts[d.country] = d.count;
      }
    });

    return waf.descCountsHash(counts);
  },

  descCountsHash: function(counts) {
    result = [];

    result[0] = Object.keys(counts).sort(function(a,b) {
      return counts[b] - counts[a];
    });
    result[1] = result[0].map(function(d) {
      return counts[d];
    });

    return result;
  },

  init: function(wafData) {
    // get timezone offset
    var timezoneOffset = new Date().getTimezoneOffset() * 60000;

    waf.data = wafData.map(function(d) {
      // convert numbers and dates
      d.count = +d.count;
      d.lat   = +d.lat;
      d.lng   = +d.lng;
      // convert to GMT
      d.date  = new Date((+d.timestamp * 1000) + timezoneOffset);

      // store synthesized data here
      d.hour  =  d.date.getHours();
      return d;
    });
  }
}
