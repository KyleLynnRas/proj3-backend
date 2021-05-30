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
// Import BodyParser
const bodyParser = require ('body-parser');
// Import bcrypt
const bcrypt = require('bcrypt');
//Import saltRounds
const saltRounds = 12;

app.set(MONGODBURI, 'nodeRestApi');



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
})

const Job = mongoose.model('Job', JobSchema)

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

UserSchema.pre('save', function(next) {
    this.password = bcrypt.hashSync(this.password, saltRounds);
    next();
});

const userModel = mongoose.model('User', UserSchema)



///////////////////////////////
// MIDDLEWARE
////////////////////////////////

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));


// Create and Authenticate functions
const create = (req, res, next) => {
    userModel.create({username: req.body.username, password: req.body.password}, function (error, result) {
        if (error) {
            next(error);
        } else {
            res.json({status: "success", message: "User successfully added!", data: null});
        }
    });
};

const authenticate = (req, res, next) => {
    userModel.findOne({username:req.body.username}, function (error, userInfo) {
        if (error) {
            next(error)
        } else {
            if(bcrypt.compareSync(req.body.password, userInfo.password)) {
                const token = jwt.sign({id: userInfo._id}, MONGODBURI, {expiresIn: '1h'});
                res.json({status:"success", message: "User Found!", data:{user: userInfo, token: token}});
            } else {
                res.json({status:"error", message: "Invalid Username/Password", data: null});
            }
        }
    });
};

const validateUsers = (req, res, next) => {
    jwt.verify(req.headers['x-access-token'],
    MONGODBURI, function(err, decoded) {
        if (err) {
            res.json({status:'error', message: err.message, data:null})
        } else {
            //add user id to request
            req.body.userId = decoded.id;
            next();
        }
    });
}

app.use('/jobs', validateUsers)


///////////////////////////////
// ROUTES
////////////////////////////////

// Sign-up route
app.post('/auth/signup', create);

// Login route
app.post('/auth/login', authenticate);


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