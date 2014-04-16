var controller = {
  // called when the selector(s) are changed
  update: function() {
    console.log("update!");
    timeRangeSelector.update();
    waf.refreshFilteredData();
    uiUtil.update();
    bubbleMap.update();
    pp1.update();
    dt1.update();
    dt2.update();
  },

  // initialize the visualization
  initVis: function(error, wafData, world, countries) {
    // stash data
    waf.init(wafData);
    // init utils
    countryCodes.init(countries, world);
    uiUtil.initCountrySelector("#countrySelector")
      .on("change", function() {
        controller.update();
      });
    uiUtil.initNetworkSelector("#networkSelector")
      .on("change", function() {
        controller.update();
      });

    // update the filtered data
    waf.refreshFilteredData();

    // init time range selector
    timeRangeSelector.init(gTimeSelector, bbTimeSelector);

    // init the world map
    bubbleMap.init(gMapWrapper, bbMap, world);

    // draw polar plot
    pp1 = new PolarPlot(gPolarWrapper, bbPolar, "Attacks Per Hour", "Times in GMT; Mean in gray", d3.range(24), [waf.getFilteredHourlyMean, waf.getFilteredDataGroupedHourly], ['lightblue', colorAttack]);

    // draw data tables
    dt1 = new DataTable(gDataTableWrapper, bbDataTable, "Top Countries for Selection", "", ['Country'], [waf.getTopCountries], 10);

    dt2 = new DataTable(gDataTableWrapper2, bbDataTable, "Other Top 10 Lists for Selection", "", ['Browser', 'Operating System'], [waf.getTopBrowsers, waf.getTopOperatingSystems], 10);

    // update the UI
    controller.update();
  },

  init: function() {
    queue()
      .defer(d3.csv, "../data/waf_5mi")
      .defer(d3.json, "../data/world_data.json")
      .defer(d3.json,"../data/countrycodes.json")
      .await(controller.initVis);
  }
};
