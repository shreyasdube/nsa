NSA - Not Safe Anymore
===
CS171 Final Project - Visualization of Web Attacks on the Web over a 24-hour period. 

URL: http://notsafeanymo.appspot.com/

Authors:
* Shreyas Dube
* Christopher Gerber

## Background and Motivation 

Web Security is an on-going concern for all organizations and individuals. It is also a time and resource consuming exercise that needs to be balanced against other priorities. Given the recent online attacks on big banks and retailers, we are interested in visualizing the attributes of such attacks - which countries do they target the most, what times of the day are popular for such attacks and what networks (ISPs) are they carried out on.

## Project Objectives

As an individual interested in using the Internet for online shopping and financial transactions, I want to understand the risks associated with my actions when I am online. By looking at various visualizations of the data we hope to show both geographic and cyclical trends, and help discover unexpected patterns.

By answering the following questions through the visualization, we aim to provide our users with a better understanding of their risks while online:
* What geographic and cyclical patterns are present in the data?
* What time of day are the risks lowest?
* Which ISP’s provide the best security?

## Directory Layout
### Code
* JavaScript: `js/*`
* HTML: `index.html`

### Data
* `data/waf_5mi` for the attack dataset
* `data/countrycodes.json` and `data/world_data.json` reused from HW4 for map data
