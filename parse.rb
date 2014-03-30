#!/usr/bin/env ruby

# Usage: ruby parse.rb [file_name] [minutes]
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

File.open(filename) do |file|
  file.each do |line|
    time_stamp, country, state, city, lat, lon, isp, user_agent = line.split(',')

    time_bucket = ( time_stamp.to_i / (mins_per_bucket * 60 * 1000.0) ).round * mins_per_bucket * 60

    agent = UserAgent.parse(CGI.unescape(user_agent))

    puts [time_bucket, country, state, city, lat, lon, isp, user_agent.chomp, agent.browser, agent.version.to_s, agent.platform].join(',')
  end
end
