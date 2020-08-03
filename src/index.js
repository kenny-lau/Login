const app = require('./app')
const port = process.env.PORT

app.listen(port, () => {
    console.log('Login is up on port: ' + port)
})