#!/usr/bin/env ruby

# Usage: ruby quick_stats.rb [file_name] [minutes]
#
# You may need to run `gem install useragent` first, if it is not installed on your machine
#
# Representative row from dataset:
# 1393976466191,US,VA,HERNDON,38.9807,-77.3799,,Mozilla%2F5.0+%28Windows+NT+6.1%3B+WOW64%3B+rv%3A23.0%29+Gecko%2F20100101+Firefox%2F23.0

require 'cgi'
require 'useragent'

filename = ARGV[0] || 'waf_block_ms_country_state_lat_long_network_useragent'
mins_per_bucket = ARGV[1].to_i || 5
separators = ';()'

metrics = {
  :time_bucket => {},
  :country => {},
  :state => {},
  :city => {},
  :isp => {},
  :platform => {},
  :browser => {},
  :browser_type => {}
}

File.open(filename) do |file|
  file.each do |line|
    time_stamp, country, state, city, lat, lon, isp, user_agent = line.split(',')

    time_bucket = ( time_stamp.to_i / (mins_per_bucket * 60 * 1000.0) ).round * mins_per_bucket * 60

    agent = UserAgent.parse(CGI.unescape(user_agent))

    metrics[:time_bucket][time_bucket] = metrics[:time_bucket][time_bucket].to_i + 1
    metrics[:country][country] = metrics[:country][country].to_i + 1
    metrics[:state]["#{country},#{state}"] = metrics[:state]["#{country},#{state}"].to_i + 1
    metrics[:city]["#{country},#{state},#{city}"] = metrics[:city]["#{country},#{state},#{city}"].to_i + 1
    metrics[:isp][isp] = metrics[:isp][isp].to_i + 1
    metrics[:platform][agent.platform] = metrics[:platform][agent.platform].to_i + 1
    metrics[:browser]["#{agent.browser},#{agent.version.to_s}"] = metrics[:browser]["#{agent.browser},#{agent.version.to_s}"].to_i + 1
    metrics[:browser_type]["#{agent.browser}"] = metrics[:browser_type]["#{agent.browser}"].to_i + 1
  end
end

p metrics
