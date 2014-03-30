package org.cs171.nsa.agg;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Aggregates waf attack data by all columns
 *
 */
public class App {

    private static void agg(BufferedWriter w, Long timestamp, List<Line> lines)
            throws IOException {
        if (lines.isEmpty()) {
            return;
        }

        Map<Line, Integer> lineCount = new LinkedHashMap<>();
        for (Line line : lines) {
            if (lineCount.containsKey(line)) {
                // increment existing count
                lineCount.put(line, (lineCount.get(line) + 1));
            } else {
                // add new entry
                lineCount.put(line, 1);
            }
        }
        System.out.println(timestamp + " ==> " + lineCount);

        // write data to file
        for (Map.Entry<Line, Integer> entry : lineCount.entrySet()) {
            w.write("\n" + timestamp + "," + entry.getKey().toString() + ","
                    + entry.getValue());
        }
    }

    private static void start(String fileName) throws IOException {
        BufferedReader r = null;
        BufferedWriter w = null;
        try {
            // file reader
            r = new BufferedReader(new FileReader(fileName));

            // file writer
            w = new BufferedWriter(new FileWriter(fileName + "_agg"));
            // write header
            w.write("timestamp,country,state,city,lat,lng,network,browser,browserVersion,os,count");

            String s;
            // the current timestamp that's being processed
            Long currTimestamp = 0L;
            List<Line> linesForCurrentTimestamp = new ArrayList<>();
            while ((s = r.readLine()) != null) {
                // get timestamp
                Long timestamp = Long.valueOf(s.split(",")[0]);
                if (!currTimestamp.equals(timestamp)) {
                    agg(w, currTimestamp, linesForCurrentTimestamp);
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
            if (w != null) {
                w.close();
            }
        }
    }

    public static void main(String[] args) {
        if (args.length == 0) {
            throw new IllegalArgumentException("Specify input file to aggregate. E.g.: waf_block_ms_country_state_lat_long_network_useragent");
        }
        try {
            final String fileName = args[0];
            start(fileName);
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }
}
