const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://Limeslices:' + process.env.MONGOPASS + '@cluster0.b8qxdyr.mongodb.net/?retryWrites=true&w=majority?tls=true', {
    dbName: 'mbo-api',
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})