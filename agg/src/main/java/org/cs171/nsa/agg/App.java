package org.cs171.nsa.agg;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Hello world!
 *
 */
public class App {

    private static void agg(Long timestamp, List<Line> lines) {
        System.out.println(timestamp + " has " + lines.toString());
    }

    private static void readFile(String fileName) throws IOException {
        BufferedReader r = null;
        try {
            r = new BufferedReader(new FileReader(fileName));
            String s;
            // the current timestamp that's being processed
            Long currTimestamp = 0L;
            List<Line> linesForCurrentTimestamp = new ArrayList<>();
            while ((s = r.readLine()) != null) {
                // get timestamp
                Long timestamp = Long.valueOf(s.split(",")[0]);
                if (!currTimestamp.equals(timestamp)) {
                    agg(currTimestamp, linesForCurrentTimestamp);
                    // aggregate lines for previous timestamp
                    currTimestamp = timestamp;
                    linesForCurrentTimestamp.clear();
                } else {
                    currTimestamp = timestamp;
                    // store all lines for this timestamp
                    linesForCurrentTimestamp.add(new Line(s));
                }
            }
        } finally {
            if (r != null) {
                r.close();
            }
        }

    }

    public static void main(String[] args) {
        if (args.length == 0) {
            throw new IllegalArgumentException("Specify input file to aggregate. E.g.: waf_block_ms_country_state_lat_long_network_useragent");
        }
        try {
            final String fileName = args[0];
            readFile(fileName);
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }
}
