var controller = {
  // initialize map of data files we have
  datasets: {
    taxDay: {
      file: "../data/waf-20140415_cleaned_sorted_agg",
      description: "2014 Tax Day"
    },
    blackFriday: {
      file: "../data/waf-20131129_cleaned_sorted_agg",
      description: "2013 Black Friday"
    },
    cyberMonday: {
      file: "../data/waf-20131202_cleaned_sorted_agg",
      description: "2013 Cyber Monday"
    }
  },
  // retrieves query parameter from the URL
  getRequestParameter: function (name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\//g, ''));
  },

  // called when the selector(s) are changed
  update: function() {
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
    uiUtil.initWafStartEnd();

    // update the filtered data
    waf.refreshFilteredData();

    // init time range selector
    timeRangeSelector.init(gTimeSelector, bbTimeSelector);
    uiUtil.initPlayButton("#playButtonWrapper", timeRangeSelector);

    // init the world map
    bubbleMap.init(gMapWrapper, bbMap, world);

    // draw polar plot
    pp1 = new PolarPlot(gPolarWrapper, bbPolar, d3.range(24), [waf.getFilteredHourlyMean, waf.getFilteredDataGroupedHourly], ['polarMean', 'polarAttack']);

    // draw data tables
    dt1 = new DataTable(gDataTableWrapper, bbDataTable, ['Country'], [waf.getTopCountries], 10);

    dt2 = new DataTable(gDataTableWrapper2, bbDataTable, ['Browser', 'Operating System'], [waf.getTopBrowsers, waf.getTopOperatingSystems], 10);

    // update the UI
    controller.update();
  },

  init: function() {
    // select default data file
    var selectedDataset = controller.datasets["taxDay"];
    var day = controller.getRequestParameter("day");
    if (day && controller.datasets[day]) {
      selectedDataset = controller.datasets[day];
    }
    // update heading
    d3.select("#datasetDescription").text(selectedDataset.description);

    queue()
      .defer(d3.csv, selectedDataset.file)
      .defer(d3.json, "../data/world_data.json")
      .defer(d3.json,"../data/countrycodes.json")
      .await(controller.initVis);
  }
};
