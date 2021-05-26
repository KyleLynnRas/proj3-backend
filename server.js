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
// Import Webtoken
const jwt = require('jsonwebtoken');


const token = jwt.sign({hello: 'world'}, MONGODBURI);
console.log(token);

const decoded = jwt.verify(token, MONGODBURI);
console.log(decoded);

// Authorize Function
const auth = (req, res, next) => {
    const {authorization} = req.headers
    if (authorization) {
        const token = authorization.split(' ')[1]
        const result = jwt.verify(token, MONGODBURI)
        req.user = result;
        next();
    } else {
        res.send('NO TOKEN')
    };
};

// Dummy User
const user = { username: 'ValerieLarson', password: 'password' };

// Auth Route
app.post('/jobs/login', async (req, res) => {
    const { username, password } = req.body
    if (username === user.username && password === user.password) {
        const token = await jwt.sign({ username }, MONGODBURI)
        await res.json(token);
    } else {
        res.send('WRONG USERNAME OR PASSWORD')
    };
});

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
    url: String,
    notes: {type: String, required: false},
    applied: {type: Boolean, default: false},
    interviewed: {type: Boolean, default: false},
    cover_letter: {type: Boolean, default: false},
    resume: {type: Boolean, default: false},
    user: { username: String, password: String }
})

const Job = mongoose.model('Job', JobSchema)

///////////////////////////////
// MIDDLEWARE
////////////////////////////////

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

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

///////////////////////////////
// LISTENER
////////////////////////////////
app.listen(PORT, () => console.log(`Port ${PORT} is clear for takeoff.`))