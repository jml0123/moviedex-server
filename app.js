require('dotenv').config()
const express = require('express');
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors")
const MOVIE_DATA = require('./movies-data-small.json')

const app = express();

app.use(helmet());
const morganSetting = process.env.NODE_ENV === "production" ? "tiny" : "common"
app.use(morgan(morganSetting))
app.use(cors())

app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_ENV === 'production') {
      response = { error: { message: 'server error' }}
    } else {
      response = { error }
    }
    res.status(500).json(response)
  })

app.use(function validateToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get("Authorization")

    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        res.status(401).json({error: "Unauthorized Request. Invalid API Key"})
    }
    next();
})

const handleGetMovies = (req, res) => {
    const {genre, country, avg_vote, sort} = req.query;
   
    let response = MOVIE_DATA;

    if (genre) {
        response = response.filter(film => 
            film.genre.toLowerCase().includes(genre.toLowerCase())
        )
    }
    if (country) {
        response = response.filter(film => 
            film.country.toLowerCase().includes(country.toLowerCase()) 
    )}
    if (avg_vote) {
        if (isNaN(avg_vote)){
            return res
            .status(400)
            .send("Average vote must be a number value")
        }
        Number(avg_vote) === avg_vote;
        if (avg_vote > 10 || avg_vote < 0) {
            return res
            .status(400)
            .send("Average vote must be a number between 1 to 10")
        }
        response = response.filter(film =>
           film.avg_vote >= avg_vote
        )
    }
    if (!response.length) {
        response = 'Cannot find any movies for this search'
    }
    
    // Added a boolean sort query to sort from highest to lowest
    if(sort) {
        response.sort((a, b) => {
        return a["avg_vote"] < b["avg_vote"] ? 1 : a["avg_vote"] > b["avg_vote"] ? -1 : 0
    })};
    return res.json(response)
}

app.get("/movie", handleGetMovies)

module.exports = app;

