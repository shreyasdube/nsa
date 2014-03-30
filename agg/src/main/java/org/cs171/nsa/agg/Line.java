/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package org.cs171.nsa.agg;

import java.util.Objects;

/**
 *
 * @author sdube
 */
public class Line {

    private String country, state, city;
    private Float lat, lng;
    private String isp, userAgent;
    private String browser, version, os;

    public Line(String line) {
        String[] tokens = line.split(",", 11);
        if (tokens.length == 11) {
            country = tokens[1];
            state = tokens[2];
            city = tokens[3];

            lat = Float.valueOf(tokens[4]);
            lng = Float.valueOf(tokens[5]);

            isp = tokens[6];
            userAgent = tokens[7];
            browser = tokens[8];
            version = tokens[9];
            os = tokens[10];
            
            setDefaults();
        } else {
            throw new IllegalArgumentException("Invalid line: " + line);
        }
    }
    
    private void setDefaults() {
        if (isp.trim().isEmpty()) {
            isp = "-";
        }
        if (userAgent.trim().isEmpty()) {
            userAgent = "-";
        }
        if (browser.trim().isEmpty()) {
            browser = "-";
        }
        if (version.trim().isEmpty()) {
            version = "-";
        }
        if (os.trim().isEmpty()) {
            os = "-";
        }
    }

    @Override
    public int hashCode() {
        int hash = 5;
        hash = 79 * hash + Objects.hashCode(this.country);
        hash = 79 * hash + Objects.hashCode(this.state);
        hash = 79 * hash + Objects.hashCode(this.city);
        hash = 79 * hash + Objects.hashCode(this.lat);
        hash = 79 * hash + Objects.hashCode(this.lng);
        hash = 79 * hash + Objects.hashCode(this.isp);
        hash = 79 * hash + Objects.hashCode(this.userAgent);
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
        if (!Objects.equals(this.userAgent, other.userAgent)) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return country + "," + state + "," + city + "," + lat + "," + lng + "," 
                + isp + "," + browser + "," + version + "," + os;
    }
}
