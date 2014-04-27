var uiUtil = {
  themeSelectorId: null,
  countrySelectorId: null,
  networkSelectorId: null,
  playButtonId: null,
  timeRangeSelector: null,
  isPlaying: false,
  themes: {
    standard: {
      label: "Standard",
      Attack: [255,0,0],
      NoAttack: [144,144,144],
      Background: [39,40,34],
      Lowlight: [169,169,169],
      Normal: [211,211,211],
      Highlight: [255,255,255]
    },
    colorblind: {
      label: "Color-blind Friendly",
      Attack: [178,24,43],
      NoAttack: [224,224,224],
      Background: [77,77,77],
      Lowlight: [135,135,135],
      Normal: [186,186,186],
      Highlight: [255,255,255]
    }
  },

  initThemeSelector: function(themeSelectorId) {
    uiUtil.themeSelectorId = themeSelectorId;

    var select = d3.select(themeSelectorId).append("select");
    select.selectAll("option").data(Object.keys(uiUtil.themes))
      .enter().append("option")
      .attr("value", function(d) { return d; })
      .text(function(d) { return uiUtil.themes[d].label; });

    return select;
  },
  // swapAProperty({selectorName:'@Attack', property:'rgb(178,24,43)'});
  // refreshTheme();

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

    var select = d3.select(countrySelectorId).append("select");

    // concat world + countries
    select
      .selectAll("option").data([world].concat(countries))
      .enter().append("option")
      .attr("value", function(d) { return d.iso2Code; })
      .text(function(d) { return d.name; });

    return select;
  },

  // gets selected country
  getSelectedCountry: function() {
    return d3.select(uiUtil.countrySelectorId + " > select").node().value;
  },

  initNetworkSelector: function(networkSelectorId) {
    uiUtil.networkSelectorId = networkSelectorId;

    // get all networks in sorted order
    var networks = waf.getNetworks();

    var select = d3.select(networkSelectorId).append("select");

    select
      .selectAll("option").data(["*"].concat(networks))
      .enter().append("option")
      .attr("value", function(d) { return d; })
      .text(function(d) { return d; });

    return select;
  },

  // gets selected network
  getSelectedNetwork: function() {
    return d3.select(uiUtil.networkSelectorId + " > select").node().value;
  },

  initWafStartEnd: function() {
    // FYI: use reduce, rather than min, to limit memory usage
    // get the min date in the set
    dataStart = waf.data.reduce(function(prev,curr) {
      if (prev.date < curr.date) return prev;
      return curr;
    }).date;
    // get the max date in the set
    dataEnd = waf.data.reduce(function(prev,curr) {
      if (prev.date > curr.date) return prev;
      return curr;
    }).date;

    // update the visualization
    d3.select('#data_start').text(longDateFormat(dataStart));
    d3.select('#data_end').text(longDateFormat(dataEnd));
  },

  initPlayButton: function(playButtonId, timeRangeSelector) {
    uiUtil.playButtonId = playButtonId;
    uiUtil.timeRangeSelector = timeRangeSelector;

    uiUtil.isPlaying = false;

    var that = this;

    var tickCallback = function() {
      return function() {
        if (that.isPlaying) {
          timeRangeSelector.animate();
          d3.timer(tickCallback(), transitionDuration);
        }
        return true;
      }
    };

    var button = d3.select(playButtonId)
      .append("image")
        .attr({
          x: 3,
          y: 3,
          width: 64,
          height: 64,
          "xlink:href": "/img/play_pause.png"
        })
        .on("click", function() {
          that.isPlaying = !(that.isPlaying);
          if (that.isPlaying) d3.timer(tickCallback());
        });
  },

  updateNumberOfAttacks: function() {
    var count = waf.getNumberOfAttacks();
    d3.select("#numberOfAttacks")
      .transition(transitionDuration)
      // use tween[3] to animate the change .. slick!
      // also see [4]
      .tween("text", function() {
        // remove all ","s from the string; see [2]
        var number = this.textContent.split(",").join(""); 
        var i = d3.interpolate(+number, count);

        return function(t) {
          this.textContent = numberFormat(Math.round(i(t)));
        };
      });
  }, 

  update: function() {
    uiUtil.updateNumberOfAttacks();
  }

}
