var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    app = express()

const port = 8000

// Configure rendering middleware
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')
app.set('views', path.join(__dirname, '/views'));

// Configure request logging
app.use(require('morgan')('dev'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Serve static assets
app.use('/public', express.static(__dirname + '/public'))

// Configure database middleware
require('./db')

// Configure routing
app.use(require('./routes'))

app.use((err, req, res) => {
    console.log(err.stack)
    res.status(err.status || 500)
    res.json({'errors': {
        message: err.message,
        error: err
    }})
})

app.listen(port, () => {
    console.log(`Web server listening on port ${port}`)
})