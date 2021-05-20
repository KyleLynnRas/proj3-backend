///////////////////////////////
// DEPENDENCIES
////////////////////////////////
// Require .env variables
require('dotenv').config()
// Get PORT from .env
const {PORT = 8080, MONGODBURI} = process.env
// Import express
const express = require('express')
// Create app
const app = express()
// Import mongoose
const mongoose = require('mongoose')
// Import cors
const cors = require('cors')
// Import morgan
const morgan = require('morgan')

///////////////////////////////
// DATABASE CONNECTION
////////////////////////////////
// Establish connection to db
mongoose.connect(MONGODBURI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})

// Connection events
mongoose.connection
    .on('open', () => console.log('You are now connected to mongoose'))
    .on('close', () => console.log('You are no longer connected to mongoose'))
    .on('error', (error) => console.log(error))

///////////////////////////////
// MODEL
////////////////////////////////

const JobSchema = new mongoose.Schema({
    title: String,
    company_name: String,
    job_type: String,
    candidate_required_location: String,
    salary: String,
    description: String,
    url: String,
    notes: {type: String, required: false}

})

const Job = mongoose.model('Job', JobSchema)

///////////////////////////////
// MIDDLEWARE
////////////////////////////////

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

///////////////////////////////
// ROUTES
////////////////////////////////

// Test route
app.get('/', (req, res) => {
    res.send("Hello, is it me you're looking for?")
})

// Jobs index route
app.get('/jobs', async (req, res) => {
    try {
        res.json(await Job.find({}))
    } catch (error) {
        res.status(400).json(error)
    }
})

// Jobs create route
app.post('/jobs', async (req, res) => {
    try {
        res.json(await Job.create(req.body))
    } catch (error) {
        res.status(400).json(error)
    }
})

// Update route on show page
app.put('/jobs/:id', async (req, res) => {
    try {
        res.json(await Job.findByIdAndUpdate(req.params.id, req.body, {new: true}))
    } catch (error) {
        res.status(400).json(error)
    }
})

// Delete route on show page
app.delete('/jobs/:id', async (req, res) => {
    try {
        res.json(await Job.findByIdAndRemove(req.params.id))
    } catch (error) {
        res.status(400).json(error)
    }
})

app.get('/search', async (req, res) => {
    res.send('Search')
})

///////////////////////////////
// LISTENER
////////////////////////////////
app.listen(PORT, () => console.log(`Port ${PORT} is clear for takeoff.`))