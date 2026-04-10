# destifinder-site

A full-stack location-sharing social app built as a group project for a web development course at Rowan University. Users can register, log in, and share destination posts — complete with photos, ratings, and comments — all visualized on an interactive Google Maps interface.

**Contributors:** Marc Tonogbanua, Kordall Hyman, Rassiel Lorenzo, Ashley Briggs, Michael Morris

---

## About

DestiFinder is a travel-inspired social platform where users can discover and share destinations with one another. After creating an account and logging in, users can drop destination posts onto a map, attach photos, leave star ratings, write descriptions, and engage with each other's posts through a threaded comment system. A personal dashboard lets each user manage their own posts and saved favorites.

---

## Features

- **User Authentication** — Register and log in with a username and password; error handling for incorrect credentials
- **Interactive Google Maps** — Destination posts are visualized as map markers powered by the Google Maps JavaScript API (with Places and Maps libraries)
- **Create / Edit / Delete Posts** — Modal-based forms for submitting new destination posts or updating existing ones; includes title, location, photos, description, star rating, and a comments toggle
- **Photo Uploads** — Multiple image uploads per post with live preview before submission
- **Star Ratings** — 1–5 star rating system on each destination post
- **Threaded Comments** — Comment on any post, with reply support and a toggle to enable/disable comments per post
- **Favorite Posts** — Save posts to a personal favorites list
- **User Dashboard / Profile** — View your own posts, saved locations, and manage content in one place
- **Search** — Search destinations by city, zip code, or location name
- **Serverless NoSQL Storage** — Data is stored and retrieved via a NoSQL backend (no traditional server required); handled through `retrieve.js` and `submit.js`
- **Loading State** — A loading modal displays while data is being fetched

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| UI Framework | Bootstrap 3.4, jQuery |
| Fonts | Google Fonts (Italiana, Roboto) |
| Maps | Google Maps JavaScript API (Maps + Places libraries) |
| Data | Serverless NoSQL (JSON-based, no backend server) |
| Version Control | Git |

---

## Project Structure

```
destifinder-site/
├── login.html              # Login page
├── login.css               # Login page styles
├── login.js                # Login logic
├── login(og).html          # Original login prototype
├── register.html           # Registration page
├── register.css            # Registration styles
├── register.js             # Registration logic
├── register(og).html       # Original registration prototype
├── homepage.html           # Main feed (all destination posts + map)
├── homepage.css            # Homepage styles
├── homeFuncs.js            # Homepage-specific JS logic
├── dashboard.html          # User profile / personal dashboard
├── dashboard.css           # Dashboard styles
├── MapsPage.html           # Standalone maps page
├── RLdashboard.html        # Alternate dashboard view
├── RLmapFuncs.js           # Map functions for alternate dashboard
├── mapFuncs.js             # Core Google Maps logic (markers, search, etc.)
├── retrieve.js             # Fetches data from NoSQL storage
├── submit.js               # Submits/updates/deletes data in NoSQL storage
├── sliderStyles.css        # Toggle switch styles (comments on/off)
└── test.html               # Test/debug file
```

---

## Setup

This project runs entirely in the browser — no server setup required — but you will need a valid **Google Maps API key** to enable the map functionality.

1. **Clone the repository**
   ```bash
   git clone https://github.com/NotKord/destifinder-site.git
   ```

2. **Add your Google Maps API key**

   You can get a key from the [Google Cloud Console](https://console.cloud.google.com/). Make sure the **Maps JavaScript API** and **Places API** are enabled.

   **Option A — Quick (not recommended for public repos):**

   In `dashboard.html` and any other pages that load the Maps script, replace the placeholder directly:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&loading=async&libraries=maps,places&v=beta" defer></script>
   ```

   **Option B — Using a `.env` file (recommended):**

   If you're serving the project through a Node.js/Express backend or a build tool that supports environment variables, add your key to your `.env` file to avoid exposing it in your source code:
   ```
   GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

   Of course, make sure `.env` is listed in your `.gitignore` so it is never committed to the repository. Then inject the key server-side before serving the HTML. For example, with Node.js/Express:
   ```javascript
   // server.js
   require('dotenv').config();
   const express = require('express');
   const fs = require('fs');
   const app = express();

   app.get('/dashboard', (req, res) => {
     let html = fs.readFileSync('./dashboard.html', 'utf8');
     html = html.replace('YOUR_API_KEY_HERE', process.env.GOOGLE_MAPS_API_KEY);
     res.send(html);
   });

   app.listen(8000);
   ```

   Install the required package:
   ```bash
   npm install dotenv express
   ```

   > **Note:** Since this project was originally built as a static site, adding a backend just for key injection is an optional enhancement. At minimum, ensure your API key has **HTTP referrer restrictions** set in the Google Cloud Console so it can only be used from your domain.

3. **Open in browser**

   Open `login.html` directly in your browser to start, or serve the folder with a simple local server:
   ```bash
   # Using Python
   python -m http.server 8000
   ```
   Then navigate to `http://localhost:8000/login.html`.

---

## Pages

| Page | Description |
|---|---|
| `login.html` | User login with credential validation |
| `register.html` | New user registration |
| `homepage.html` | Main feed — browse all posts, interact with the map |
| `dashboard.html` | Personal profile — your posts, saved locations, and map |
| `MapsPage.html` | Standalone map view |

---

## Notes

- This is a **course project** built for educational purposes as a group assignment at Rowan University.
- Data is stored via a serverless NoSQL backend. Persistence depends on the availability of the hosting environment used during the course.
- The Google Maps API key has been removed from the repository. You will need to supply your own to run the map features locally.
- This was a collaborative group effort — we had a great time building it and learned a lot along the way!

---

Happy exploring! 🗺️✈️
