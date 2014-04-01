var countryCodes = {

	iso2CountryCodes: {},
	geoJsonCountryCodes: {},


	initCountriesMap: function(countries, useIso2Code) {
		var countriesMap = {};
		countries.forEach(function(d) {
			var code = useIso2Code ? d.iso2Code : d.id;
			countriesMap[code] = d;
		});
		return countriesMap;
	},

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

	initGeoJsonCodeLookupTable: function(countries, wafCodes) {
		var countriesMap = countryCodes.initCountriesMap(countries, false);
		for (var wafCountry in wafCodes) {
			var country = countryCodes.iso2CountryCodes[wafCountry];
			countryCodes.geoJsonCountryCodes[country.geoJsonCode] = country;
		}
	},

	init: function(countries, worldData, wafData) {
		// get all waf country codes
		var wafCodes = {};
		wafData.forEach(function(d) {
			var countryCode = d.country;
			wafCodes[countryCode] = countryCode;
		});

		countryCodes.initIsoCodeLookupTable(countries, wafCodes);
		countryCodes.initGeoJsonCodeLookupTable(countries, wafCodes);
	}

};