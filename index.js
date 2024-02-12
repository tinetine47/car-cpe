const express = require('express');
const path = require('path');
const app = express();


let dir = path.join(dirname,'static')
let url = path.resolve(dirname,'static/login.html')

app.use(express.static(dir));
const PORT = 5500;
app.listen(PORT,() => {
    console.log(`started and Listening on port ${PORT}`);
});

app.get('/main', (req, res) =>{
    res.sendFile(url)
});

app.get('/test', (req,res) =>{
    res.setHeader('Content-Type', 'text/html')
    res.send('<h1>Test Page</h1>')
})
