require('dotenv').config()
const supertest = require('supertest');
const app = require('../app');
const { expect } = require('chai');

describe('GET/movies', () => {
    it('should be 403 forbidden if invalid auth token is passed', () => {
        return supertest(app)
            .get("/movie")
            .set("Authorization", `Bearer bad token`)
            .expect(403, {error: "Unauthorized Request. Invalid API Key"})
    })
    it('should be 403 forbidden if no auth token is passed', () => {
        return supertest(app)
            .get("/movie")
            .expect(403, {error: "Unauthorized Request. Invalid API Key"})
    })

    it('should return an array of movies', () => {
        return supertest(app)
            .get("/movie")
            .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
            .expect(200)
            .expect('Content-Type', /json/)
            .then(res => {
                expect(res.body).to.be.an('array');
                const movie = res.body[0];
                expect(movie).to.include.all.keys(
                    'film_title', 'year', 'genre', 'duration', 'country', 'director',
                    'actors', 'avg_vote', 'votes'
                )
            })
    })
    it('should be 400 if invalid avg_vote query', () => {
        return supertest(app)
            .get("/movie")
            .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
            .query({avg_vote: "bad query"})
            .expect(400, "Average vote must be a number value")
         
    })
    it('should be 400 if avg_vote query is out of range', () => {
        return supertest(app)
            .get("/movie")
            .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
            .query({avg_vote: 22})
            .expect(400, 'Average vote must be a number between 1 to 10')
    })
    it('should be 400 if avg_vote query is out of range', () => {
        return supertest(app)
            .get("/movie")
            .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
            .query({avg_vote: -3})
            .expect(400, 'Average vote must be a number between 1 to 10')
    })
    it('should indicate if no matches exist', () => {
        return supertest(app)
            .get("/movie")
            .set("Authorization", `Bearer ${process.env.API_TOKEN}`)
            .query({genre: "does not exist"})
            .then(res => {
                expect(res.body).to.be.equal("Cannot find any movies for this search")
            })
    })
})
