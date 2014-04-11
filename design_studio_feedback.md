## Review Details

Group Members: 
* Jie Zhang
* Esther Weeks 

Quality of feedback: very helpful

## General Questions
### Are the objectives interesting to the target audience? 
Yes, very interesting.

### Is the scope of the project appropriate? If not, suggest improvements.
Seems to be a good scope for two people, some animation like adding a play button to play the change over a day can be added to just make it fuller. 

### Is the split between optional and must-have features appropriate? Why?
I think they have a very good split.

### Is the visualization innovative? Creative? Why?
The visualization is very innovative, It is very creative to using the polar chart to show time line.

### Does the visualization scale to the used dataset? Could it handle larger but similar datasets?  
Using only one day of data does not represents the statistics, it describes what happened on that day. It could be misleading to the user if there is not clear indication about the dataset. This could be solved by either aggregating data from many days or give the user a clarification about this visualization is only a snapshot instead of statistical.

## Visual Encoding

### Does the visualization follow the principles used in class? 
Yes. Overview (map), then drill down to the detail by polar chart and time selectors.

### What is the primary visual encoding? Does it match to the most important aspect of the data?
Location and colors are used as primary visual encoding. We suggest to view this visualization in grayscale to see if it will work well for color-disabled audience.

### What other visual variables are used? Are they effective?

### Is color sensibly used? If not, suggest improvements.
Red is a good color for indicating something not safe, it is sensibly used.

## Interaction and Animation.

### Is the interaction meaningful? If not, suggest improvements.
The interactions are very meaningful.

### If multiple views, are they coordinated? If not, would it be meaningful?
Multiple views are coordinated. One things could be an issue is that GMT time used for the polar chart. The scale of the visualization could be the world, the GMT time doesn't indicate local business hours of different locations obviously. It could be improved by converting the time to local time.

### Is there any animation planned? Is it clear? Is it intuitive? 
The animation of the visualization is very clear and intuitive.

## Questions:

### The bubbles can potentially appear cluttered. How do you plan to address this?
We allow the user to zoom in and out, and use opacity to allow overlapped bubbles to still be visible.

ACTION: None

### Is the polar plot tied to the city?
No. The polar plot is tied to the filters.

ACTION: Better label the polar plot to clarify the meaning.

### On the polar plot can you show both the local and GMT time?
That is a possibility. We also talked about possibly allowing the user to toggle between global time and normalized time.

ACTION: Provide better labeling around the timezone of the hours, and look into toggling between global and normalized time.

### Are you using shades of red to convey meaning?
No. It’s actually the opacity.

ACTION: None

### You should see how the red looks in gray-scale to understand how it will appear to a color-blind user.
ACTION: Look at visualization in gray-scale, and make changes if necessary.

### What other elements will be added to the visualization?
* Top 10 lists for country, ISP, etc.
* Considering bot vs. real users

ACTION: Add at least one more linked visualization.

### How did you do the data aggregation?
We used Ruby and Java, and focused on the 5 minute data aggregations to start.

ACTION: None

### Does 24 hours show enough time to actually identify trends? What if you had a month of data?
The data set is too small to extrapolate long-term trends, but we are limited in what we can obtain from Akamai at this time.

ACTION: None

### You should put the date or date range on the page somewhere.
ACTION: Add start and end time of data set on the page.

### You should add explanatory text to guide the user.
ACTION: Add an explanation of the page elements. Mention the data source, time zone, etc.

### You should consider adding a “Play” button to roll through the day hour-by-hour.
ACTION: Look into adding this animation.
