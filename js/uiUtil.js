var uiUtil = {

  countrySelectorId: null,
  networkSelectorId: null,

  initCountrySelector: function(countrySelectorId) {
    uiUtil.countrySelectorId = countrySelectorId;

    // get all countries in sorted order
    var countries = countryCodes.getSortedCountries();

    // create manual entry for the entire world
    var world = {
      iso2Code: "*",
      geoJsonCode: "*",
      name: "World"
    }

    d3.select(countrySelectorId).append("select")
        // concat world + countries
        .selectAll("option").data([world].concat(countries))
        .enter().append("option")
        .attr("value", function(d) { return d.iso2Code; })
        .text(function(d) { return d.name; });
  }, 

  // gets selected country
  getSelectedCountry: function() {
    return d3.select(uiUtil.countrySelectorId + " > select").node().value; 
  },

  initNetworkSelector: function(networkSelectorId) {
    uiUtil.networkSelectorId = networkSelectorId;

    // get all networks in sorted order
    var networks = waf.getNetworks();

    d3.select(networkSelectorId).append("select")
        .selectAll("option").data(["*"].concat(networks))
        .enter().append("option")
        .attr("value", function(d) { return d; })
        .text(function(d) { return d; });
  },

  // gets selected network
  getSelectedNetwork: function() {
    return d3.select(uiUtil.networkSelectorId + " > select").node().value; 
  }

}