# Call2Code_VAura

# 🌍 GeoNarrator – Turn Your Route into a Story

> 🚗 A smart travel companion that narrates interesting facts and stories about the places you pass using Google Maps and Wikipedia APIs.

---

## 🧠 What is GeoNarrator?

**GeoNarrator** transforms everyday travel into a meaningful learning experience. By analyzing your route and combining it with publicly available data from Wikipedia, the app narrates short and fascinating facts about historical landmarks, cultural sites, and notable places along the way.

Whether you're a tourist, commuter, student, or adventurer — GeoNarrator makes your journey informative and engaging, without interrupting your navigation.

---

## 📍 Example Use Case

**Input:**
- Origin: Chennai, India
- Destination: Mahabalipuram, India

**GeoNarrator Output:**
```json
[
  {
    "title": "Marina Beach",
    "summary": "Marina Beach is one of the longest urban beaches in the world, playing a key role in Chennai’s cultural identity."
  },
  {
    "title": "San Thome Basilica",
    "summary": "This 16th-century Roman Catholic church is built over the tomb of Saint Thomas the Apostle."
  }
]
```

## 🔧 How It Works

1. **User inputs origin and destination.**
2. The app uses **Google Maps Directions API** to fetch the route and extract key waypoints.
3. For each waypoint, it calls **Wikipedia’s Geosearch API** to find nearby landmarks or articles.
4. It then fetches **short summaries** of those locations using **Wikipedia’s Summary API**.
5. The user receives a stream of geo-linked stories that can be displayed as cards or played through narration.

📊 _Coming Soon:_ Interactive map with markers, voice narration (TTS), multilingual support, and user-contributed content.

---

## 🌐 Public APIs Used

| API | Purpose |
|-----|---------|
| [Google Maps Directions API](https://developers.google.com/maps/documentation/directions/start) | Retrieve route and waypoints between two locations |
| [Wikipedia Geosearch API](https://www.mediawiki.org/wiki/API:Geosearch) | Find nearby Wikipedia articles based on geographic coordinates |
| [Wikipedia Summary API](https://en.wikipedia.org/api/rest_v1/#/Page%20content/get_page_summary__title_) | Fetch short and readable descriptions for each article |

---

## 🛠 Tech Stack

- **Backend:** Node.js with Express for building RESTful APIs  
- **APIs:** Google Maps Directions, Wikipedia Geosearch and Summary (no API key needed for Wikipedia)  
- **Output Format:** JSON (suitable for both console and frontend parsing)  
- **Future Plans:** React-based frontend UI, Text-to-Speech voice engine, interactive map interface, offline content caching

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-team/geonarrator.git
cd geonarrator
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Add Your Google Maps API Key

-Create a .env file in the root directory and add:
```env
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 4. Run the Project

```bash
node index.js
```
