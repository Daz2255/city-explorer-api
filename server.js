const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const PORT = process.env.PORT || 8080;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("I will be shown on the Browser");
  console.log("I will be shown on the Terminal");
});

app.get("/weather", async (req, res) => {
  const { lat, lon, searchQuery } = req.query;

  console.log("Received query parameters:", lat, lon, searchQuery);

  if (!lat || !lon || !searchQuery) {
    return res.status(400).json({ error: "Missing query parameters" });
  }

  try {
    // Make an HTTPS request to Weatherbit API
    const weatherResponse = await axios.get(
      `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${WEATHER_API_KEY}`
    );

    const { data } = weatherResponse.data;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "City not found" });
    }

    const forecasts = data.slice(0, 2).map((weatherData) => {
      const forecast = new Forecast(
        weatherData.valid_date,
        weatherData.weather.description
      );
      return forecast;
    });

    res.json(forecasts);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return res.status(500).json({ error: "Error fetching weather data" });
  }
});

// Route to fetch movies about each city
app.get("/movies", async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: "Missing city query parameter" });
  }

  try {
    // Fetch movies from the TMDB API using the city name
    const movieUrl = `https://api.themoviedb.org/3/search/movie?api_key=${MOVIE_API_KEY}&query=${encodeURIComponent(
      city
    )}`;
    const movieResponse = await axios.get(movieUrl);

    const movies = movieResponse.data.results.map((movie) => {
      return new Movie(
        movie.title,
        movie.release_date,
        movie.overview,
        movie.poster_path
      );
    });

    res.json(movies);
  } catch (error) {
    console.error("Error fetching movie data:", error);
    return res.status(500).json({ error: "Error fetching movie data" });
  }
});

app.listen(PORT, () => console.log(`app is running on port ${PORT}`));

class Forecast {
  constructor(date, description) {
    this.date = date;
    this.description = description;
  }
}

class Movie {
  constructor(title, releaseDate, overview, posterPath) {
    this.title = title;
    this.releaseDate = releaseDate;
    this.overview = overview;
    this.posterPath = posterPath;
  }
}
