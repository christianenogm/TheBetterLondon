## Epic 1: Account & Profile Management

### US-101: Create an Account with Email

**As a** London resident  
**I want to** create an account using my email and password  
**So that** I can start reporting issues in my community

**User Scenarios:**

- New resident downloads the app
- Wants to report a pothole on their street
- Creates account with name, email, password
- Receives confirmation they're registered
- Can now access all app features

**Success Criteria:**

- [ ] I can enter my name, email, and password
- [ ] I see clear error messages if something is wrong (email already used, weak password)
- [ ] I'm taken to the home screen after successful registration
- [ ] My account is saved and I can log back in later


**Priority:** Critical

### US-102: Sign In to My Account

**As a** returning user  
**I want to** log in with my email and password  
**So that** I can access my account and previous reports

**User Scenarios:**

- Opens app on new day
- Enters email and password
- Logs in successfully
- Sees their dashboard with previous activity

**Success Criteria:**

- [ ] I can enter my email and password
- [ ] I see a "Forgot Password?" option if I don't remember
- [ ] I'm taken to my home screen after logging in
- [ ] I see an error message if my credentials are wrong
- [ ] My login is remembered so I don't have to sign in every time


**Priority:** Critical

---

### US-103: Sign In with Google

**As a** user  
**I want to** sign in using my Google account  
**So that** I don't need to create and remember another password

**User Scenarios:**

- New or returning user
- Taps "Sign in with Google"
- Selects their Google account
- Immediately logged in
- Can start using the app

**Success Criteria:**

- [ ] I see a "Sign in with Google" button
- [ ] Tapping it opens my Google accounts
- [ ] I can choose which account to use
- [ ] I'm logged in without creating a password
- [ ] My information is saved for future logins


**Priority:** High

---

### US-104: Reset My Forgotten Password

**As a** user who forgot my password  
**I want to** reset my password via email  
**So that** I can regain access to my account

**User Scenarios:**

- User can't remember password
- Taps "Forgot Password?"
- Enters their email
- Receives reset link in email
- Creates new password

**Success Criteria:**

- [ ] I can tap "Forgot Password?" on login screen
- [ ] I enter my email address
- [ ] I receive a password reset email within minutes
- [ ] The link in the email works and lets me set a new password
- [ ] I can log in with my new password


**Priority:** Medium

---

### US-105: View My Profile and Stats

**As a** user  
**I want to** view my profile and contribution statistics  
**So that** I can see my impact on the community

**User Scenarios:**

- User taps Profile tab
- Views their name, email, profile picture
- Sees total reports submitted
- Sees points earned
- Sees badges earned

**Success Criteria:**

- [ ] I can access my profile from the bottom navigation
- [ ] I see my name and email
- [ ] I see how many reports I've submitted
- [ ] I see my points and badges
- [ ] I can log out from this screen


**Priority:** Medium

---

### US-106: Log Out of My Account

**As a** user  
**I want to** log out of my account  
**So that** my information stays private on a shared device

**User Scenarios:**

- User wants to log out
- Taps logout button
- Confirms they want to log out
- Returned to login screen

**Success Criteria:**

- [ ] I can find the logout button easily
- [ ] I'm asked to confirm before logging out
- [ ] I'm taken to the login screen after logging out
- [ ] My data is cleared from the device
- [ ] I need to log in again to access my account


**Priority:** High

---

## Epic 2: Report Community Issues

### US-201: Choose What Type of Issue to Report

**As a** resident  
**I want to** select the type of issue I'm reporting  
**So that** my report is properly categorized

**User Scenarios:**

- User sees a pothole on their street
- Opens app and taps "Report Issue"
- Sees list of issue types
- Selects "Pothole"
- Proceeds to add photos

**Available Issue Types:**

- Pothole
- Garbage Pile-up / Illegal Dumping
- Broken Sidewalk
- Overgrown Tree Blocking Path
- Streetlight Outage
- Graffiti / Vandalism
- Other

**Success Criteria:**

- [ ] I see clear icons and labels for each issue type
- [ ] I can easily tap the type that matches my issue
- [ ] I can select "Other" if my issue doesn't fit the categories
- [ ] The app remembers what I selected


**Priority:** Critical

---

### US-202: Take Photos of the Issue

**As a** user  
**I want to** take multiple photos of the issue  
**So that** the city can clearly see the problem

**User Scenarios:**

- User selected issue type
- Opens camera to photograph pothole
- Takes photo from different angles
- Can take up to 5 photos
- Reviews photos before submitting

**Success Criteria:**

- [ ] The camera opens automatically after selecting issue type
- [ ] I can take multiple photos (up to 5)
- [ ] I can see thumbnails of all photos I've taken
- [ ] I can delete a photo if I don't like it
- [ ] I can retake photos if needed
- [ ] I can choose photos from my gallery instead of taking new ones


**Priority:** Critical

---

### US-203: Add Location to My Report

**As a** user  
**I want** the app to automatically capture where the issue is located  
**So that** the city knows exactly where to fix it

**User Scenarios:**

- User takes photos of pothole
- App automatically gets their current location
- Map shows pin at their location
- Address is displayed
- User can adjust pin if needed

**Success Criteria:**

- [ ] The app automatically detects my location
- [ ] I see my location on a map
- [ ] The address is shown (e.g., "123 Main St, London, ON")
- [ ] I can drag the pin to adjust the exact location
- [ ] I can manually enter an address if location detection doesn't work
- [ ] I see a clear error message if I haven't given location permission


**Priority:** Critical

---

### US-204: Add a Title and Description

**As a** user  
**I want to** add a title and description to my report  
**So that** I can explain the issue in detail

**User Scenarios:**

- User has photos and location
- Adds title: "Large pothole on Main St"
- Adds description: "Deep pothole approximately 2 feet wide, causing cars to swerve"
- Reviews all information
- Submits report

**Success Criteria:**

- [ ] I can type a short title (up to 100 characters)
- [ ] I can optionally add a longer description (up to 500 characters)
- [ ] I see a character counter so I know my limits
- [ ] The title is required, but description is optional
- [ ] I can see all my information (photos, location, title, description) before submitting


**Priority:** Critical

---

### US-205: Submit My Report

**As a** user  
**I want to** submit my complete report  
**So that** the city is notified and can take action

**User Scenarios:**

- User reviews all report information
- Taps "Submit Report"
- Sees progress indicator
- Report is submitted successfully
- Receives confirmation

**Success Criteria:**

- [ ] I can tap a clear "Submit Report" button
- [ ] I see a progress indicator while the report is uploading
- [ ] I receive a confirmation message when it's submitted
- [ ] I earn 10 points for submitting the report
- [ ] I'm taken to the reports feed where I can see my new report
- [ ] If something goes wrong, I see a clear error message and can try again


**Priority:** Critical

---

## Epic 3: View Community Reports

### US-301: See All Reports in My Area

**As a** resident  
**I want to** see all reports submitted by the community  
**So that** I'm aware of issues in my neighborhood

**User Scenarios:**

- User opens the app
- Home screen shows feed of all reports
- Scrolls through reports
- Sees issues near them
- Taps to view details

**Success Criteria:**

- [ ] I see a feed of all community reports when I open the app
- [ ] Each report shows: photo, issue type, title, location, how long ago it was posted
- [ ] I can see the status (submitted, under review, in progress, resolved)
- [ ] I can pull down to refresh and see new reports
- [ ] I can scroll down to see more reports
- [ ] Reports load quickly without lag


**Priority:** Critical

---

### US-302: View Full Details of a Report

**As a** user  
**I want to** view complete details of a report  
**So that** I can see all information about the issue

**User Scenarios:**

- User sees interesting report in feed
- Taps on it
- Views all photos, description, location
- Sees status and update history
- Can upvote or share

**Success Criteria:**

- [ ] I can tap any report to see full details
- [ ] I see all photos in a gallery I can swipe through
- [ ] I see the full title and description
- [ ] I see the exact location on a map
- [ ] I see who submitted it and when
- [ ] I see the current status (e.g., "Under Review")
- [ ] I can upvote the report if it affects me too
- [ ] I can share the report with others


**Priority:** High

---

### US-303: View My Submitted Reports

**As a** user  
**I want to** see a list of all my submitted reports  
**So that** I can track their status

**User Scenarios:**

- User goes to Profile
- Taps "My Reports"
- Sees list of all their reports
- Can filter by status
- Taps to view details

**Success Criteria:**

- [ ] I can access "My Reports" from my profile
- [ ] I see all reports I've submitted
- [ ] I can filter by: All, Open Issues, Resolved Issues
- [ ] Each report shows its current status
- [ ] I can tap any report to see full details
- [ ] I see "No reports yet" if I haven't reported anything


**Priority:** Medium

---

### US-304: Upvote Reports That Affect Me

**As a** user  
**I want to** upvote reports that also affect me  
**So that** important issues get more attention

**User Scenarios:**

- User sees a report about a pothole on their commute route
- Taps the upvote button
- Upvote count increases
- Report gets higher priority

**Success Criteria:**

- [ ] I see an upvote button on each report
- [ ] I can tap it to upvote
- [ ] The upvote count increases immediately
- [ ] I can only upvote each report once
- [ ] I can see which reports I've already upvoted
- [ ] Popular reports appear higher in the feed


**Priority:** Medium

---

## Epic 4: App Navigation & Experience

### US-401: Navigate Between App Sections

**As a** user  
**I want to** easily navigate between different parts of the app  
**So that** I can quickly access the features I need

**User Scenarios:**

- User wants to see reports: taps Home
- User wants to report issue: taps Report button
- User wants to check transit: taps Transit
- User wants to view profile: taps Profile

**Success Criteria:**

- [ ] I see a navigation bar at the bottom with clear icons
- [ ] I can tap any section to go there instantly
- [ ] The current section is highlighted
- [ ] Icons are easy to understand (Home, Report, Transit, Profile)
- [ ] Navigation is smooth and fast


**Priority:** Critical

---

## Epic 5: Find Transit Information

### US-501: Search for Bus Routes and Stops

**As a** transit rider  
**I want to** search for bus routes or stops by name or number  
**So that** I can quickly find the transit information I need

**User Scenarios:**

- User needs to take Route 2 downtown
- Opens Transit tab
- Types "Route 2" or "Downtown" in search
- Sees results instantly
- Taps result to see route on map

**Success Criteria:**

- [ ] I see a search bar at the top of the Transit screen
- [ ] I can type route numbers (e.g., "2", "15") or names
- [ ] I can search for stop names (e.g., "Richmond & Oxford")
- [ ] Search results appear as I type
- [ ] Results show both routes and stops
- [ ] Tapping a result shows it on the map
- [ ] My recent searches are saved for quick access


**Priority:** High

---

### US-502: Find Bus Stops Near Me

**As a** user  
**I want to** find bus stops near my current location  
**So that** I can catch the nearest bus

**User Scenarios:**

- User is at downtown restaurant
- Wants to find nearest bus stop
- Taps "Nearby Stops"
- Sees list of stops within walking distance
- Chooses closest one

**Success Criteria:**

- [ ] I see a "Nearby Stops" button on the Transit screen
- [ ] Tapping it shows stops near me
- [ ] Stops are sorted by distance
- [ ] I see how far each stop is (e.g., "0.2 km" or "5 min walk")
- [ ] I can tap any stop to see which buses serve it
- [ ] The list updates if I move to a different location


**Priority:** High

---

### US-503: View All Bus Stops on a Map

**As a** user  
**I want to** see all bus stops displayed on a map  
**So that** I can visually locate them

**User Scenarios:**

- User opens Transit tab
- Sees map of London
- All bus stops shown as pins
- Zooms in to see more detail
- Taps stop to get information

**Success Criteria:**

- [ ] I see a map when I open the Transit tab
- [ ] All bus stops in London are shown as pins
- [ ] I can zoom in and out on the map
- [ ] I can pan around to explore different areas
- [ ] Stops are grouped together when zoomed out (for clarity)
- [ ] Tapping a stop pin shows me information about it
- [ ] The map loads quickly and is smooth to use


**Priority:** Critical

---

## Epic 6: View Bus Stop Information

### US-601: See Stop Details and Next Arrivals

**As a** transit rider  
**I want to** tap on a bus stop to see when the next buses arrive  
**So that** I know when to head to the stop

**User Scenarios:**

- User taps stop on map
- Bottom panel slides up
- Shows stop name and location
- Displays next 5 bus arrivals
- Can see estimated times

**Success Criteria:**

- [ ] Tapping a stop shows a panel with details
- [ ] I see the stop name and stop number
- [ ] I see which routes serve this stop
- [ ] I see the next 5 bus arrivals with times
- [ ] Times show as "In 5 min", "In 23 min", etc.
- [ ] I can refresh to update the times
- [ ] I see "No upcoming buses" if none are scheduled
- [ ] Panel shows "Add to Favorites" button


**Priority:** Critical

---

### US-602: Get Directions to a Bus Stop

**As a** user  
**I want to** get walking directions to a selected bus stop  
**So that** I can navigate there easily

**User Scenarios:**

- User finds a stop they want to use
- Taps "Get Directions"
- App opens their preferred maps app
- Can follow directions to the stop

**Success Criteria:**

- [ ] I see a "Get Directions" button in stop details
- [ ] Tapping it opens my phone's maps app (Google Maps or Apple Maps)
- [ ] The stop location is correctly set as the destination
- [ ] I can follow turn-by-turn directions
- [ ] I can choose to walk, bike, or drive


**Priority:** Medium

---

### US-603: Save Favorite Bus Stops

**As a** regular transit user  
**I want to** save my frequently-used stops as favorites  
**So that** I can quickly see when my buses arrive

**User Scenarios:**

- User regularly takes bus from work
- Taps "Add to Favorites" on their stop
- Stop is saved
- Next time they open app, they see it in favorites list
- Can quickly check next arrivals

**Success Criteria:**

- [ ] I can tap "Add to Favorites" on any stop
- [ ] The stop is saved to my favorites list
- [ ] I see my favorites at the top of the Transit screen
- [ ] Each favorite shows the next 2 arrivals
- [ ] I can tap a favorite to see full details
- [ ] I can remove stops from favorites by swiping or tapping a button
- [ ] I can save up to 10 favorite stops


**Priority:** Medium

---

### US-604: Reorder My Favorite Stops

**As a** user  
**I want to** reorder my favorite stops  
**So that** my most-used stops appear first

**User Scenarios:**

- User has 5 favorite stops
- Priorities change (new job, different routine)
- Long-presses and drags to reorder
- Most important stops now at top

**Success Criteria:**

- [ ] I can long-press a favorite stop to move it
- [ ] I can drag it up or down in the list
- [ ] The order is saved automatically
- [ ] My most-used stops can be at the top
- [ ] The new order stays the same next time I open the app


**Priority:** Low

---

## Epic 7: View Bus Route Information

### US-701: See a Route's Path on the Map

**As a** user  
**I want to** see a bus route's complete path on the map  
**So that** I can visualize where it goes

**User Scenarios:**

- User searches for "Route 2"
- Taps the route
- Route path appears on map as a line
- All stops along route are highlighted
- Can see entire route at once

**Success Criteria:**

- [ ] When I select a route, its path is drawn on the map
- [ ] The path is clearly visible in a distinct color
- [ ] All stops along the route are marked
- [ ] The map zooms to show the entire route
- [ ] I can see where the route starts and ends
- [ ] I can tap any stop along the route to see details
- [ ] I can clear the route to see the map normally again


**Priority:** Critical

---

### US-702: View Route Information Panel

**As a** user  
**I want to** see key information about a bus route  
**So that** I know if it meets my needs

**User Scenarios:**

- User views Route 15
- Sees route number and name
- Learns operating hours
- Sees how often buses run
- Understands route coverage

**Success Criteria:**

- [ ] I see a panel at the bottom showing route details
- [ ] Route number and name are clearly displayed (e.g., "Route 2 - Downtown")
- [ ] I see the first and last stops
- [ ] I see operating hours (e.g., "5:30 AM - 11:30 PM")
- [ ] I see how often buses run (e.g., "Every 15 minutes")
- [ ] I can expand the panel to see more details
- [ ] I see a button to view the full schedule


**Priority:** Medium

---

### US-703: View Full Route Schedule

**As a** planner  
**I want to** see the complete schedule for a route  
**So that** I can plan my trip in advance

**User Scenarios:**

- User planning trip for tomorrow
- Opens Route 2 details
- Taps "View Full Schedule"
- Sees all stops and times
- Can plan exact departure time

**Success Criteria:**

- [ ] I can tap "View Full Schedule" from route details
- [ ] I see a table showing all stops and times
- [ ] I can switch between weekday and weekend schedules
- [ ] Times are shown for the entire day
- [ ] The current time is highlighted if viewing today's schedule
- [ ] I can scroll through all stops
- [ ] I can share the schedule with others


**Priority:** Medium

---

## Epic 8: Real-Time Bus Tracking (If Available)

### US-801: See Buses Moving in Real-Time

**As a** user  
**I want to** see buses moving on the map in real-time  
**So that** I know exactly where my bus is

**User Scenarios:**

- User waiting for Route 2
- Opens Transit tab
- Sees bus icon moving on map
- Knows bus is 2 minutes away
- Heads to stop at right time

**Success Criteria:**

- [ ] I see bus icons on the map showing actual bus locations
- [ ] Buses move on the map as they travel their routes
- [ ] I can tell which route each bus is on by color or number
- [ ] I can tap a bus to see its route and next stops
- [ ] Bus locations update every 10-15 seconds
- [ ] If real-time data is unavailable, I see the regular schedule instead


**Priority:** High  
**Note:** Only possible if LTC provides real-time data API

---

### US-802: Track My Specific Bus

**As a** rider  
**I want to** track a specific bus I'm planning to catch  
**So that** I know exactly when to leave

**User Scenarios:**

- User needs to catch the 3:15 PM Route 2
- Selects that specific trip
- Sees bus location updating
- Gets notification when bus is 5 minutes away

**Success Criteria:**

- [ ] I can select a specific bus/trip from the schedule
- [ ] That bus is highlighted on the map
- [ ] I see estimated arrival time at my stop
- [ ] I receive a notification when the bus is close
- [ ] I can see if the bus is running late or early
- [ ] The tracking updates in real-time


**Priority:** Medium  
**Note:** Requires real-time API

---

## Epic 9: Service Alerts & Updates

### US-901: See Service Alerts for Routes

**As a** transit user  
**I want to** see alerts about delays, detours, or cancellations  
**So that** I can plan alternative transportation

**User Scenarios:**

- Route 2 has major delay due to accident
- User opens Transit tab
- Sees alert banner at top
- Reads about delay
- Can plan different route

**Success Criteria:**

- [ ] I see alert banners for active service disruptions
- [ ] Alerts show route numbers and issue types (delay, detour, cancellation)
- [ ] I can tap an alert to read full details
- [ ] Alerts are color-coded by severity (yellow for delay, red for cancellation)
- [ ] I only see alerts relevant to routes I use or favorites
- [ ] I can dismiss alerts I've read


**Priority:** Low

---

## Epic 10: Improved Reports Feed

### US-1001: Filter Reports by Type

**As a** user  
**I want to** filter reports by issue type  
**So that** I can see specific types of problems

**User Scenarios:**

- User interested in pothole reports
- Opens filter menu
- Selects "Potholes"
- Feed shows only pothole reports
- Can clear filter to see all

**Success Criteria:**

- [ ] I see a filter button on the reports feed
- [ ] I can select one or multiple issue types
- [ ] The feed updates to show only filtered reports
- [ ] Active filters are clearly shown
- [ ] I can clear filters to see all reports again
- [ ] My filter preferences are remembered


**Priority:** Medium

---

### US-1002: Filter Reports by Status

**As a** user  
**I want to** filter reports by their status  
**So that** I can see which issues are resolved or still open

**User Scenarios:**

- User wants to see what's been fixed
- Opens filter
- Selects "Resolved"
- Sees all fixed issues
- Feels encouraged by city's response

**Success Criteria:**

- [ ] I can filter by: All, Open Issues, Under Review, In Progress, Resolved
- [ ] The feed updates instantly
- [ ] I see a count of reports in each category
- [ ] I can quickly switch between statuses
- [ ] Resolved issues show when they were fixed


**Priority:** Medium

---

### US-1003: Filter Reports by Distance

**As a** user  
**I want to** filter reports by distance from me  
**So that** I can see issues in my neighborhood

**User Scenarios:**

- User wants to see issues near them
- Selects "Within 1 km"
- Sees only nearby reports
- All are on streets they recognize

**Success Criteria:**

- [ ] I can filter by distance: 1 km, 5 km, 10 km, or All
- [ ] Reports show distance from me (e.g., "0.5 km away")
- [ ] Only reports within selected distance appear
- [ ] Map view reflects the distance filter
- [ ] I can change the distance range anytime


**Priority:** Medium

---

### US-1004: Sort Reports Different Ways

**As a** user  
**I want to** sort reports by different criteria  
**So that** I can see the most relevant issues first

**User Scenarios:**

- User wants to see most urgent issues
- Selects "Most Upvoted"
- Feed reorders to show popular reports
- Can see what matters to community

**Success Criteria:**

- [ ] I can sort by: Most Recent, Closest to Me, Most Upvoted
- [ ] The feed reorders immediately
- [ ] Current sort option is clearly indicated
- [ ] Default is "Most Recent"
- [ ] My sort preference is remembered
- [ ] I can easily switch between sort options


**Priority:** Low

---

### US-1005: See Report Status Updates

**As a** user who submitted a report  
**I want to** be notified when my report's status changes  
**So that** I know the city is taking action

**User Scenarios:**

- User reported pothole 3 days ago
- Receives notification: "Your report is under review"
- Two weeks later: "Work has started"
- Finally: "Your report has been resolved!"

**Success Criteria:**

- [ ] I receive a push notification when my report status changes
- [ ] Notification message is clear and specific
- [ ] Tapping the notification takes me to my report
- [ ] I can see status history in report details
- [ ] I can opt out of these notifications if I want
- [ ] I feel informed about progress on my reports


**Priority:** High

---

## Epic 11: Garbage & Recycling Schedules

### US-1101: Find My Garbage Schedule

**As a** homeowner or renter  
**I want to** enter my address to find my garbage collection schedule  
**So that** I never miss garbage day

**User Scenarios:**

- New resident just moved in
- Doesn't know garbage day
- Opens app, enters address
- Sees their collection schedule
- Sets up reminders

**Success Criteria:**

- [ ] I see a "Garbage Schedule" section in the app
- [ ] I can enter my address (or use current location)
- [ ] The app finds my ward/zone automatically
- [ ] I see which day is garbage day and which is recycling day
- [ ] I see when yard waste is collected (if applicable)
- [ ] Address is saved so I don't need to enter it again


**Priority:** Critical

---

### US-1102: View My Collection Calendar

**As a** resident  
**I want to** see my garbage and recycling days on a calendar  
**So that** I can plan ahead

**User Scenarios:**

- User sets up their address
- Views calendar showing this month
- Sees green dots for garbage days
- Blue dots for recycling days
- Can navigate to next months

**Success Criteria:**

- [ ] I see a monthly calendar view
- [ ] Garbage collection days are marked clearly (e.g., green dots)
- [ ] Recycling days are marked differently (e.g., blue dots)
- [ ] Yard waste days are marked (if applicable)
- [ ] Special collection days are marked (bulk items, hazardous waste)
- [ ] I see a legend explaining the color coding
- [ ] I can swipe or tap to view future months
- [ ] I can tap any date to see what's being collected


**Priority:** Critical

---

### US-1103: See Next Collection Prominently

**As a** user  
**I want to** see my next collection date highlighted  
**So that** I don't forget to put out my bins

**User Scenarios:**

- User opens garbage schedule
- Sees large widget: "Next Collection: Tomorrow - Garbage"
- Knows immediately what to do

**Success Criteria:**

- [ ] I see a prominent widget showing my next collection
- [ ] It says "Tomorrow" or "Today" or "In 3 days"
- [ ] It specifies what's being collected (Garbage, Recycling, etc.)
- [ ] The widget updates daily automatically
- [ ] Different colors for different collection types
- [ ] Widget is visible without scrolling


**Priority:** High

---

### US-1104: Learn What Goes Where

**As a** resident  
**I want to** look up which items go in garbage vs recycling  
**So that** I sort my waste correctly

**User Scenarios:**

- User unsure if pizza boxes are recyclable
- Opens "What Goes Where"
- Searches for "pizza box"
- Learns it goes in recycling if clean, garbage if greasy

**Success Criteria:**

- [ ] I can access a "What Goes Where" guide
- [ ] I can search for specific items
- [ ] I see clear categories: Recycling, Garbage, Yard Waste, Hazardous, E-waste
- [ ] Common items are listed with icons
- [ ] I get tips on proper disposal
- [ ] I can access links to detailed city guidelines


**Priority:** Low

---

## Epic 12: Garbage Day Notifications

### US-1201: Get Reminders About Collection Days

**As a** busy resident  
**I want to** receive notifications reminding me about garbage day  
**So that** I don't forget to put out my bins

**User Scenarios:**

- User sets up notifications
- Night before garbage day at 8 PM
- Receives notification: "Garbage Day Tomorrow!"
- Puts bins out after dinner
- Doesn't miss collection

**Success Criteria:**

- [ ] I can turn on notifications for garbage day
- [ ] I receive a notification the evening before (default 8 PM)
- [ ] Notification clearly states what's being collected
- [ ] I receive separate notifications for garbage, recycling, and yard waste
- [ ] Notifications repeat weekly or biweekly based on my schedule
- [ ] I can turn off notifications if I don't want them


**Priority:** Critical

---

### US-1202: Customize Notification Time

**As a** user with a specific routine  
**I want to** choose when I receive garbage day reminders  
**So that** they fit my schedule

**User Scenarios:**

- User prefers morning reminders
- Goes to notification settings
- Changes time from 8 PM to 7 AM
- Now gets reminders at preferred time

**Success Criteria:**

- [ ] I can access notification settings
- [ ] I can choose what time I want reminders (e.g., 7 AM, 8 PM)
- [ ] I can choose "Night before" or "Morning of"
- [ ] I can set different times for different collection types
- [ ] I can test notifications to make sure they work
- [ ] My settings are saved


**Priority:** Medium

---

### US-1203: Receive Alerts for Special Collections

**As a** resident  
**I want to** be notified about special collection events  
**So that** I don't miss bulk item or hazardous waste pickups

**User Scenarios:**

- City announces hazardous waste collection day
- User receives push notification
- Sees date and what items are accepted
- Prepares materials for collection

**Success Criteria:**

- [ ] I receive notifications about special collections in my area
- [ ] Notifications include: date, type (bulk items, hazardous waste), what's accepted
- [ ] I receive these with enough advance notice (e.g., 1 week before)
- [ ] I can tap notification to see full details
- [ ] I can opt out of special collection notifications if I want


**Priority:** Medium

---

### US-1204: Add Collection Days to My Phone Calendar

**As an** organized person  
**I want to** export my garbage schedule to my phone's calendar  
**So that** I see it alongside my other appointments

**User Scenarios:**

- User wants schedule in main calendar
- Taps "Add to Calendar"
- Calendar events created for next 3 months
- Can see garbage days with all other events

**Success Criteria:**

- [ ] I see an "Add to Calendar" button
- [ ] Tapping it creates calendar events
- [ ] Events are created for the next 3 months
- [ ] Each event has a reminder set
- [ ] Works with iPhone Calendar and Google Calendar
- [ ] I can choose whether to add them or not


**Priority:** Low

---

## Epic 13: Earn Points and Badges

### US-1301: Earn Points for Actions

**As a** user  
**I want to** earn points for contributing to the community  
**So that** I feel rewarded for my participation

**User Scenarios:**

- User submits a report: +10 points
- Report gets upvoted: +1 point per upvote
- Report gets resolved: +5 bonus points
- Sees points accumulate in profile

**Success Criteria:**

- [ ] I earn 10 points for each report I submit
- [ ] I earn 1 point when someone upvotes my report
- [ ] I earn 5 bonus points when my report is resolved
- [ ] I can see my total points in my profile
- [ ] Points are displayed prominently
- [ ] I understand how I earned each point


**Priority:** Medium

---

### US-1302: View My Points History

**As a** competitive user  
**I want to** see a history of how I earned points  
**So that** I can track my contributions

**User Scenarios:**

- User checks profile
- Taps on points total
- Sees list of all point transactions
- Understands their contribution history

**Success Criteria:**

- [ ] I can tap my points to see details
- [ ] I see a chronological list of how I earned points
- [ ] Each entry shows: date, action, points earned
- [ ] I see my total points at the top
- [ ] List is easy to understand and navigate


**Priority:** Low

---

### US-1303: Unlock Achievement Badges

**As a** user  
**I want to** earn badges for reaching milestones  
**So that** I feel recognized for my contributions

**User Scenarios:**

- User submits first report: unlocks "Newbie Reporter" badge
- Submits 10 reports: unlocks "Community Helper"
- Gets first resolved report: unlocks "Impact Maker"
- Shows badges with pride in profile

**Success Criteria:**

- [ ] I automatically earn badges when I reach milestones
- [ ] I see a notification when I unlock a new badge
- [ ] Badges appear in my profile
- [ ] I can tap a badge to see how I earned it
- [ ] I can see which badges I haven't earned yet and what I need to do
- [ ] Badge icons are attractive and meaningful


**Priority:** Medium

---

### US-1304: View All Available Badges

**As a** motivated user  
**I want to** see all possible badges and their requirements  
**So that** I know what to work toward

**User Scenarios:**

- User opens badge section
- Sees earned badges (in color)
- Sees locked badges (grayed out)
- Taps locked badge to see requirements
- Gets motivated to earn more

**Success Criteria:**

- [ ] I can see all available badges in one place
- [ ] Earned badges are shown clearly
- [ ] Locked badges are grayed out
- [ ] I can tap any badge to see:
    - [ ] How to earn it
    - [ ] My progress toward it
    - [ ] When I earned it (if already earned)
- [ ] I see a - count like "You've earned 5 of 10 badges"


**Priority:** Low

---

### US-1305: See Leaderboard of Top Contributors

**As a** competitive resident  
**I want to** see a leaderboard ranking community contributors  
**So that** I can see how I compare and feel motivated

**User Scenarios:**

- User checks leaderboard
- Sees top 100 contributors
- Finds themselves ranked #27
- Gets motivated to move up
- Submits more quality reports

**Success Criteria:**

- [ ] I can access a community leaderboard
- [ ] I see top contributors ranked by points
- [ ] Each entry shows: rank, name, points, top badge
- [ ] My own rank is highlighted
- [ ] I can filter by timeframe: This Week, This Month, All Time
- [ ] I can choose to hide my name from leaderboard in settings (privacy option)
- [ ] Leaderboard updates regularly


**Priority:** Low

---

## Epic 14: App Personalization & Settings

### US-1401: Edit My Profile Information

**As a** user  
**I want to** update my profile information  
**So that** my account stays current

**User Scenarios:**

- User wants to update name
- Uploads new profile picture
- Changes displayed name
- Saves changes

**Success Criteria:**

- [ ] I can access "Edit Profile" from my profile screen
- [ ] I can change my display name
- [ ] I can upload or take a new profile picture
- [ ] I can crop/resize the image
- [ ] Changes are saved immediately
- [ ] I see my updated profile right away


**Priority:** Medium

---

### US-1402: Manage App Settings

**As a** user  
**I want to** access and manage all app settings  
**So that** I can customize my experience

**User Scenarios:**

- User opens settings
- Sees organized sections
- Can adjust notifications
- Can manage privacy
- Can access support

**Success Criteria:**

- [ ] I can access Settings from my profile
- [ ] Settings are organized in clear sections:
    - [ ] Account (name, email, password)
    - [ ] Notifications (all notification preferences)
    - [ ] Privacy (leaderboard visibility, location sharing)
    - [ ] About (app version, terms, privacy policy)
    - [ ] Support (FAQ, contact)
- [ ] All settings are easy to understand
- [ ] Changes save automatically
- [ ] I can log out from settings


**Priority:** Medium

---

### US-1403: See App Tutorial on First Launch

**As a** new user  
**I want to** see a quick tutorial when I first open the app  
**So that** I understand how to use it

**User Scenarios:**

- New user downloads app
- Opens for first time
- Sees 3-4 quick slides
- Learns about main features
- Skips to start using app

**Success Criteria:**

- [ ] I see an onboarding tutorial on first launch only
- [ ] Tutorial has 3-4 simple screens explaining:
    1. What the app does
    2. How to report issues
    3. How to use transit tracker
    4. How to set up garbage reminders
- [ ] I can skip the tutorial
- [ ] I can swipe through at my own pace
- [ ] Tutorial is shown only once (or I can access it again in settings)


**Priority:** Medium

### US-1404: Get Help and Support

**As a** user with questions  
**I want to** access help and support information  
**So that** I can resolve issues

**User Scenarios:**

- User has question about points
- Goes to Settings > Support
- Reads FAQ section
- Finds answer
- Or contacts support if needed

**Success Criteria:**

- [ ] I can access Help/Support from settings
- [ ] I see a FAQ section with common questions
- [ ] FAQs are organized by topic
- [ ] I can search FAQs
- [ ] I can contact support if needed (email or form)
- [ ] I see the app version number
- [ ] I can access terms and privacy policy

**Priority:** Low

---

## Epic 15: Enhanced User Experience

### US-1501: Receive Clear Error Messages

**As a** user  
**I want to** see helpful error messages when something goes wrong  
**So that** I understand what happened and what to do

**User Scenarios:**

- User loses internet connection
- Tries to submit report
- Sees: "No internet connection. Please check your network and try again."
- Knows exactly what's wrong

**Success Criteria:**

- [ ] Error messages are written in plain language
- [ ] Messages explain what went wrong
- [ ] Messages suggest what I should do
- [ ] Errors appear in consistent format (toast/banner/modal)
- [ ] I can dismiss error messages
- [ ] Critical errors are prioritized

- [ ]**Priority:** High

---

### US-1502: Use App Offline (Limited)

**As a** user in areas with poor connection  
**I want** basic features to work offline  
**So that** I can still use the app

**User Scenarios:**

- User in area with spotty coverage
- Can view previously loaded reports
- Can view saved garbage schedule
- Can view favorite bus stops (last known times)
- Gets synced when connection returns

**Success Criteria:**

- [ ] I can view previously loaded content when offline
- [ ] I see an indicator showing I'm offline
- [ ] I can view my garbage schedule offline
- [ ] I can view my reports offline
- [ ] New content loads automatically when connection returns
- [ ] I'm notified if I try to do something that requires internet

- [ ]**Priority:** Medium

---

### US-1503: Share Reports and Information

**As a** user  
**I want to** share reports and transit information with others  
**So that** I can inform my community

**User Scenarios:**

- User sees important pothole report
- Taps share button
- Sends to neighborhood group chat
- Others can view and upvote

**Success Criteria:**

- [ ] I see a share button on reports
- [ ] I can share via: text message, email, social media
- [ ] Shared link opens report details in app (if installed)
- [ ] I can share bus stop information
- [ ] I can share my garbage schedule
- [ ] Sharing is quick and easy
- [ ]**Priority:** Low

---

### US-1504: Receive In-App Announcements

**As a** user  
**I want to** see announcements about new features or important updates  
**So that** I stay informed

**User Scenarios:**

- New feature added to app
- User opens app
- Sees modal with announcement
- Learns about new feature
- Can start using it immediately

**Success Criteria:**

- [ ] I see announcements when I open the app (if new)
- [ ] Announcements are not intrusive
- [ ] I can dismiss announcements
- [ ] I can choose "Don't show this again"
- [ ] Announcements are concise and valuable
- [ ] I can access past announcements in settings


**Priority:** Low

---

