const express = require('express');
const cluster = require('cluster');
const http = require('http');

// Check the number of available CPU.
const numCPUs = require('os').cpus().length;
 
const app = express();
const PORT = 3001;
 
// For Master process
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
 
  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
 
  // This event is firs when worker died
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
}
 
// For Worker
else{
    
    var requestLock = function(id, onLocked){
        var options = {
          host: '127.0.0.1',
          path: '/lock?id='+id,
          port: '3000',
          method: 'GET'
        };

        var callback = function(response) {
          var str = ''
          response.on('data', function (chunk) {
            str += chunk;
          });

          response.on('end', function () {
              if(str === 'locked'){
                  onLocked(id);
              }else{
                  console.log('ERROR', str);
              }
          });
        }
        
        var req = http.request(options, callback);
        req.end();
    };
 
     var requestUnlock = function(id, onUnlocked){
        
        //The url we want is `www.nodejitsu.com:1337/`
        var options = {
          host: '127.0.0.1',
          path: '/unlock?id='+id,
          port: '3000',
          method: 'GET'
        };

        var callback = function(response) {
          var str = ''
          response.on('data', function (chunk) {
            str += chunk;
          });

          response.on('end', function () {
              if(str === 'unlocked'){
                  onUnlocked();
              }else{
                  console.log('ERROR', str);
              }
          });
        }
        
        var req = http.request(options, callback);
        req.end();
    };
    var i=0;
    var it = setInterval(function(){
        var id = process.pid+'_'+i;
        requestLock(id, function(){
            setTimeout(function(){
                requestUnlock(id, function(){
                    console.log(`Worker ${process.pid} success`, id);
                });
            }, 100);
        });
        i++;
        if(i >= 100){
            clearInterval(it);
        }
    }, 10);
 
  app.listen(PORT, err =>{
    err ?
    console.log("Error in server setup") :
    console.log(`Worker ${process.pid} started`);
  });
}