require('./db/mongoose')
const express = require('express')
const app = express()
const port = 3000 || process.env.PORT
const auth = require('./middlewares/auth')
const User = require('./models/user')
var MBO = require('mindbody-sdk');
let agenda = require('./jobs/agenda');
var path = require('path');
const cors = require('cors')

var mbo = new MBO({
    ApiKey: 'api-key',
    SiteId: -99
});


var public = path.join(__dirname, 'public');
app.use(cors())
app.use(express.json())


app.get('/', async(req, res) => {
    return res.sendFile(path.join(public, 'index.html'));
    //The follow code will be used for all page related endpoints
    const user = req.user
        /*
        TODO: 
        //Hit this endpoint every page load
        //mbo.class.classes({details}, callback) USE THIS ENDPOINTS FOR CLASSES

        mbo.staff.staff({
            'StaffIds': 'list of numbers',
            'Filters': 'list of strings',
            'SessionTypeId': Number,
            'StartDateTime': DateTime,
            'LocationId': Number
            })
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
        });`

        Probably can store students' name, student pictures, students' emails/phone number in DB,
        then make a generator function that refreshes the data every X amount of reloads to the site, or can be CRON based.

        Render the frontend with data
        */

    // return res.sendFile(path.join(public, 'index.html'));
    //get this from StartDateTime in the mbo.staff.staff() function, for now it's hardcoded one minutes ahead of Date.now()
    const oldDateObj = new Date(Date.now())
    const classTime = new Date(oldDateObj.getTime() + 1 * 60000);
    //make a check to see if the classTime is already stored in the db
    //if it's not, then store the classTime in the db and make the agenda request
    console.log(classTime.toString(), 'classTime')
    console.log(user.zoomEnabled.dateTime, 'User Date')
    if (typeof user.zoomEnabled.dateTime === 'undefined' || user.zoomEnabled.dateTime == classTime.toString() !== user.zoomEnabled.dateTime) {
        console.log(user)
        user.zoomEnabled.dateTime = classTime
        await user.save()

        agenda.schedule(
            user.zoomEnabled.dateTime, // date the function will execute
            "sendZoomEmail", { userId: user._id } // add additional information to be accessed by the function
        );
    }
})

app.post('/api/signup', async(req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
            //sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

app.post('/api/login', async(req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send({ error: 'error' })
    }
})

app.get('/api/zoomenabled', auth, async(req, res) => {
    try {
        const user = req.user
        const reqZoomState = req.query.state
        user.zoomEnabled.state = JSON.parse(reqZoomState)
        await user.save()
        res.status(200).send({ msg: "Success!" })


    } catch (error) {
        res.status(400).send({ error })
    }
})

app.listen(port, () => console.log(`API listening on port ${port}!`))