/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package org.cs171.nsa.agg;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 *
 * @author sdube
 */
public class Line {

    private static final Set<String> invalidCountries = new HashSet<>();
    private String country, state, city;
    private Float lat, lng;
    private String isp, userAgent;
    private String browser, browserVersion, os;

    {
        invalidCountries.addAll(Arrays.asList(new String[]{"-", "reserved", "AI",
            "GI", "GF", "GG", "GP", "IO", "JE", "MQ", "MS", "PM", "RE", "VG"}));
    }

    public Line(String line) {
        String[] tokens = line.split("\\,", 11);
        if (tokens.length == 11) {
            // country is required as well 
            country = tokens[1];
            if (invalidCountries.contains(country)) {
                throw new IllegalArgumentException("Invalid country!");
            }

            // some states might be undefined
            state = parse(tokens[2]);
            city = parse(tokens[3]);
            if (city.equals("-")) {
                throw new IllegalArgumentException("Need city!");
            }

            lat = Float.valueOf(tokens[4]);
            lng = Float.valueOf(tokens[5]);

            isp = parse(tokens[6]);
            userAgent = parse(tokens[7]);
            browser = parse(tokens[8]);
            browserVersion = parse(tokens[9]);
            os = parse(tokens[10]);
        } else {
            throw new IllegalArgumentException("Invalid line: " + line);
        }
    }

    private boolean containsUnsafeChars(String token) {
        return token.contains("\"") || token.contains(",")
                || token.contains("<") || token.contains(">");
    }

    private String parse(String token) {
        if (token.trim().isEmpty() || token.trim().equals(",")
                || containsUnsafeChars(token)) {
            return "-";
        } else {
            return token;
        }
    }

    @Override
    public int hashCode() {
        int hash = 5;
        hash = 41 * hash + Objects.hashCode(this.country);
        hash = 41 * hash + Objects.hashCode(this.state);
        hash = 41 * hash + Objects.hashCode(this.city);
        hash = 41 * hash + Objects.hashCode(this.lat);
        hash = 41 * hash + Objects.hashCode(this.lng);
        hash = 41 * hash + Objects.hashCode(this.isp);
        hash = 41 * hash + Objects.hashCode(this.browser);
        hash = 41 * hash + Objects.hashCode(this.browserVersion);
        hash = 41 * hash + Objects.hashCode(this.os);
        return hash;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final Line other = (Line) obj;
        if (!Objects.equals(this.country, other.country)) {
            return false;
        }
        if (!Objects.equals(this.state, other.state)) {
            return false;
        }
        if (!Objects.equals(this.city, other.city)) {
            return false;
        }
        if (!Objects.equals(this.lat, other.lat)) {
            return false;
        }
        if (!Objects.equals(this.lng, other.lng)) {
            return false;
        }
        if (!Objects.equals(this.isp, other.isp)) {
            return false;
        }
        if (!Objects.equals(this.browser, other.browser)) {
            return false;
        }
        if (!Objects.equals(this.browserVersion, other.browserVersion)) {
            return false;
        }
        if (!Objects.equals(this.os, other.os)) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return country + "," + state + "," + city + "," + lat + "," + lng + ","
                + isp + "," + browser + "," + browserVersion + "," + os;
    }
}
