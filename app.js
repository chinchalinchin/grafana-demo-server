const express = require('express')
const path = require('path');
const bodyParser = require('body-parser')
const cors = require('cors')
const helper = require('./helper.js')
const proxy = require('express-http-proxy');


// EXPRESS SETUP
const app = express()
app.use(bodyParser.urlencoded({extended : false}))
app.use(bodyParser.json())

// ENABLE CORS
app.use(cors())

// ROUTING
  // SCRIPTS
app.get('/scripts/helper/', function(req, res, next){
  helper.log("Serving Helper Script...", "/scripts/helper/")
  res.setHeader('Content-Type', 'text/javascript;charset=utf-8,')
  res.sendFile(path.join(__dirname, 'helper.js'))
})

  // GRAFANA ANONYNMOUS REDIRECT
app.get('/redirect/grafana/getAnonPanel', function(req, res, next){
  helper.log("Redirecting to Grafana", "/redirect/grafana/getAnonPanel/")
  const now = new Date().getTime()
  const anonLink = helper.constructAnonUrl(1, now, now - helper.calculateTimeDelta(), 2, 500, 500)
  res.redirect(anonLink)
})

  // GRAFANA AUTHENTICATED REDIRECT
app.get('/redirect/grafana/getAuthPanel', function(req, res, next){
  helper.log("Redirecting to Grafana", "/redirect/grafana/getAuthPanel/")
  const now = new Date().getTime()
  const authLink = helper.constructAuthUrl(1, now, now - helper.calculateTimeDelta(), 2, 500, 500)
  res.setHeader("Authorization", `Bearer ${helper.grafanaApiKey()}`)
  res.redirect(authLink)
})

  // GRAFANA ANONYMOUS PROXY
 app.use('/proxy/grafana/getAnonPanel', proxy("http://localhost:8088/"))

  // GRAFANA AUTHENTICATED PROXY
app.use('/proxy/grafana/getAuthPanel', proxy("http://localhost:8080/", {
    proxyReqPathResolver: function (req) {
      console.log(`Proxy Link: ${req.url}`)
      return req.url;
    },
      proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
        console.log("Proxying To Grafana Server...", "/proxy/grafana/getAuthPanel/")
        proxyReqOpts.headers['Authorization'] = `Bearer ${helper.grafanaApiKey()}`;
        proxyReqOpts.method = 'GET';
        return proxyReqOpts;
  }
}))

  // HTML PAGES
app.get('/example/anon-panels', function(req, res, next){
    helper.log("Serving grafana_anon_panel.html", '/example/anon-panels/')
    res.sendFile(path.join(__dirname, 'grafana_component', 'grafana_anon_panel.html'))
});

app.get('/example/auth-panels', function(req, res, next){
  helper.log("Serving grafana_auth_panel.html", "/example/auth-panels/")
  res.sendFile(path.join(__dirname, 'grafana_component', 'grafana_auth_panel.html'))
})

// SERVER 
  // LISTEN
app.listen(8000, function(){
    helper.log("Listening On Port 8000...", "listen");
});