const express = require('express')
const app = express()
const port = 3000

var currentConnection = null;
var currentConnectionTime = 0;

var clock = setInterval(function(){
    currentConnectionTime++;
    if(currentConnectionTime >= 60){
        currentConnectionTime = 0;
        currentConnection = null;
    }
}, 1000);

app.get('/lock', (req, res) => {
    var id = req.query.id;
    if(!currentConnection){
        currentConnection = id;
        currentConnectionTime = 0;
        res.send('locked');
    }else{
        var it = setInterval(function(){
            if(!currentConnection){
                currentConnection = id;
                currentConnectionTime = 0;
                res.send('locked');
                clearInterval(it);
            }
        }, 50);
    }
});

app.get('/unlock', (req, res) => {
    if(currentConnection === req.query.id){
        currentConnection = null;
        currentConnectionTime = 0;
        res.send('unlocked');
    }else{
        res.send('error');
    }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


