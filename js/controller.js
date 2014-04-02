var controller = {
  // initialize the visualization
  initVis: function(error, wafData, world, countries) {
    // stash data
    waf.init(wafData);
    // init utils
    countryCodes.init(countries, world);
    uiUtil.initCountrySelector("#countrySelector");
    uiUtil.initNetworkSelector("#networkSelector");
    // draw world
    drawWorld(world);
    // overlay attacks
    showAttacks();
    // draw polar plot
    drawPolar();
  }, 
  
  init: function() {
    queue()
      .defer(d3.csv, "../data/waf_5mi")
      .defer(d3.json, "../data/world_data.json")
      .defer(d3.json,"../data/countrycodes.json")
      .await(controller.initVis);
  }
};