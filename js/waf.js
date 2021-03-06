var waf = {
  data: null,
  filteredData: null,
  timeFilteredData: null,

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

    // console.log("filter by ", country, network);
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
    // console.log("filter by extent", extent);

    // Recache the filtered data before applying time filter
    waf.filteredData = waf.filterByCountryAndNetwork();

    // filter, and sort array in DESC order
    waf.timeFilteredData = waf.filteredData.filter(function(d) {
      // check if data falls within time range
      return (d.hour >= extent[0] && d.hour < extent[1]);
    }).sort(function(a, b) {
      return d3.descending(a.count, b.count);
    });
  },

  getFilteredHourlyMean: function() {
    var extent = timeRangeSelector.brush.extent();
    var data = waf.getFilteredDataGroupedHourly().map(function (d, i) {
      if (i >= extent[0] && i < extent[1]) return d;
    });

    // calculate the mean, and then return an arc of that value
    var mean = d3.mean(data);
    return d3.range(24).map(function(d, i) {
      if (i >= extent[0] && i < extent[1]) return mean;
      return 0;
    });
  },

  groupHourly: function(filteredData) {
    var hourBuckets = d3.range(24).map(function() { return 0; });

    // bucket counts based upon hour of the day
    filteredData.forEach(function(d) {
      hourBuckets[d.hour] += d.count;
    });

    return hourBuckets;
  },

  getFilteredDataGroupedHourly: function() {
    return waf.groupHourly(waf.timeFilteredData);
  },

  // this is used by the time range selector only
  getCompleteFilteredDataGroupedHourly: function() {
    return waf.groupHourly(waf.filterByCountryAndNetwork());
  },

  getFilteredHierarchy: function() {
    // this dataset can be used by hierarchical visualizations
    var root = {Attacks: {}}

    waf.timeFilteredData.forEach(function(d) {
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

    // initialize with all cities
    waf.data.forEach(function(d) {
      var cityId = d.id;
      // only add new cities
      if (!cities[cityId]) {
        // create new city
        cities[cityId] = {
          id: cityId,
          city: d.city,
          lat: d.lat,
          lng: d.lng,
          count: 0
        }
      }
    });

    waf.timeFilteredData.forEach(function(d) {
      var cityId = d.id;
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

    // sum all the things!
    waf.timeFilteredData.forEach(function(d) {
      count += d.count;
    });

    return count;
  },

  getDataForCity: function(city) {
    var cityData = waf.timeFilteredData.filter(function(d) {
      return d.id === city.id;
    });

    var completeCityData = waf.filteredData.filter(function(d) {
      return d.id === city.id;
    });

    return {
      attacks: {
        city: city.count,
        total: waf.getNumberOfAttacks()
      },
      hourlyComplete: waf.groupHourly(completeCityData),
    };
  },

  getTopBrowsers: function() {
    counts = {};

    waf.timeFilteredData.forEach(function(d) {
      counts[d.browser] = d.count + (counts[d.browser] || 0);
    });

    return waf.descCountsHash(counts);
  },

  getTopOperatingSystems: function () {
    counts = {};

    waf.timeFilteredData.forEach(function(d) {
      counts[d.os] = d.count + (counts[d.os] || 0);
    });

    return waf.descCountsHash(counts);
  },

  getTopCountries: function (){
    counts = {};

    waf.timeFilteredData.forEach(function(d) {
      counts[d.country] = d.count + (counts[d.country] || 0);
    });

    return waf.descCountsHash(counts);
  },

  descCountsHash: function(counts) {
    // First pass to get the sorted keys
    result = Object.keys(counts).sort(function(a,b) {
      return counts[b] - counts[a];
    });

    // Second pass to return array of {item:k, count:v}
    return result.map(function(d) {
      return {
        item: d,
        count: counts[d]
      };
    });
  },

  visibleRange: function() {
    // find the bounds of the visible data for auto-zooming
    var minLng = d3.min(waf.filteredData.map(function(d) { return d.lng; }));
    var minLat = d3.min(waf.filteredData.map(function(d) { return d.lat; }));
    var maxLng = d3.max(waf.filteredData.map(function(d) { return d.lng; }));
    var maxLat = d3.max(waf.filteredData.map(function(d) { return d.lat; }));
    return [{lng:minLng, lat:maxLat}, {lng:maxLng, lat:minLat}];
  },

  // for testing only!
  attackHistogram: function() {
    // how many cities have the same number of attacks?
    var attackCountBreakdown = {};
    waf.data.forEach(function(d) {
      var count = d.count;
      if (attackCountBreakdown[count]) {
        attackCountBreakdown[count].count ++;
      } else {
        attackCountBreakdown[count] = {
          numAttacks: count,
          count: 1
        };
      }
    });

    // convert to array
    var countArray = [];
    for (var count in attackCountBreakdown) {
      countArray.push(attackCountBreakdown[count]);
    }

    // sort array in DESC order
    countArray.sort(function(a, b) {
      return d3.descending(a.count, b.count);
    });

    return countArray;

  },

  init: function(wafData) {
    waf.data = wafData.map(function(d) {
      // convert numbers and dates
      d.count = +d.count;
      d.lat   = +d.lat;
      d.lng   = +d.lng;
      // convert to GMT
      d.date  = new Date(+d.timestamp * 1000);

      // store synthesized data here
      d.id   = d.country + "-" + d.state + "-" + d.city;
      d.hour =  d.date.getUTCHours();
      return d;
    });
  }
}
