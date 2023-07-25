const express = require("express");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 8080;

const app = express();

app.use(cors());

const data = require("./data/weather.json");

class Forecast {
  constructor(date, description) {
    this.date = date;
    this.description = description;
  }
}

app.get("/", (req, res) => {
  res.send("I will be shown on the Browser");
  console.log("I will be shown on the Terminal");
});

app.get("/weather", (req, res) => {
  const { lat, lon, searchQuery } = req.query;

  console.log("Received query parameters:", lat, lon, searchQuery);

  if (!lat || !lon || !searchQuery) {
    return res.status(400).json({ error: "Missing query parameters" });
  }

  const matchedCity = data.find(
    (city) =>
      city.city_name.toLowerCase() === searchQuery.toLowerCase() &&
      parseFloat(city.lat) === parseFloat(lat) &&
      parseFloat(city.lon) === parseFloat(lon)
  );

  console.log("Matched city:", matchedCity);

  if (!matchedCity) {
    return res.status(404).json({ error: "City not found" });
  }

  const forecasts = matchedCity.data.map(
    (data) => new Forecast(data.valid_date, data.weather.description)
  );

  res.json(forecasts);
});

app.listen(PORT, () => console.log(`app is running on port ${PORT}`));
