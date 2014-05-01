var countryCodes = {

  iso2CountryCodes: {},
  geoJsonCountryCodes: {},

  // creates a map of countries either based on iso2Code or id
  initCountriesMap: function(countries, useIso2Code) {
    var countriesMap = {};
    countries.forEach(function(d) {
      var code = useIso2Code ? d.iso2Code : d.id;
      countriesMap[code] = d;
    });
    return countriesMap;
  },

  // inits iso code lookup table
  initIsoCodeLookupTable: function(countries, wafCodes) {
    var countriesMap = countryCodes.initCountriesMap(countries, true);
    for (var wafCountry in wafCodes) {
      var country = countriesMap[wafCountry];
      countryCodes.iso2CountryCodes[wafCountry] =  {
        geoJsonCode: country.id,
        iso2Code: country.iso2Code,
        name: country.name,
        capitalCity: country.capitalCity
      };
    }
  },

  // inits geoJson code lookup table
  initGeoJsonCodeLookupTable: function(countries, wafCodes) {
    var countriesMap = countryCodes.initCountriesMap(countries, false);
    for (var wafCountry in wafCodes) {
      var country = countryCodes.iso2CountryCodes[wafCountry];
      countryCodes.geoJsonCountryCodes[country.geoJsonCode] = country;
    }
  },

  init: function(countries, worldData) {
    // get all waf country codes
    var wafCodes = {};
    waf.data.forEach(function(d) {
      var countryCode = d.country;
      wafCodes[countryCode] = countryCode;
    });

    // init lookup tables
    countryCodes.initIsoCodeLookupTable(countries, wafCodes);
    countryCodes.initGeoJsonCodeLookupTable(countries, wafCodes);
  },

  getSortedCountries: function() {
    // get all countries in sorted order
    var countries = [];
    for (var country in countryCodes.iso2CountryCodes) {
      countries.push(countryCodes.iso2CountryCodes[country]);
    }

    // sort countries
    countries.sort(function(a, b) {
      // sort countries by name
      return d3.ascending(a.name, b.name);
    });

    return countries;
  }

};
