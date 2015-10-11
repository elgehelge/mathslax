var Express = require('express');
var BodyParser = require('body-parser');
var Jade = require('jade');
var Typeset = require('./typeset.js');
var util = require('util');
var request = require('request');

var SERVER = process.env.SERVER || '127.0.0.1';
var PORT = process.env.PORT || '8080';

// Install the routes.
var router = Express.Router();
router.get('/', function(req, res) {
  res.json(['Hello', 'World', {underDevelopment: true}]);
});
router.post('/typeset', function(req, res) {
  var cd = new Date();
  var requestString = req.body.text;
  var bpr = 'math\\!';
  console.log(cd + ":" + requestString);
  console.log( " going to send "+bpr );
  var typesetPromise = Typeset.typeset(requestString,bpr);
  if (typesetPromise === null) {
    res.send('no text found to typeset');
    res.end(); // Empty 200 response -- no text was found to typeset.
    return;
  }
  var promiseSuccess = function(mathObjects) {
    var locals = {'mathObjects': mathObjects,
                  'serverAddress': util.format('http://%s:%s/', SERVER, PORT)};
    var htmlResult = Jade.renderFile('./views/slack-response.jade', locals);
    res.end();
    var webhook = "https://hooks.slack.com/services/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";
    var data = 
      {
        "username": "MathJax bot",
        "icon_url": "https://marketplace-cdn.atlassian.com/files/icons/876612_high.png",

        "attachments": [
          {
            "fallback": "<" + htmlResult + "|Click here> to see MathJax of " + requestString,
            "text": "MathJax of " + requestString,
            "image_url": htmlResult
          }
        ]
      }
    );
    console.log("Now POSTing to webhook!");
    request.post(webhook, data,
      function (error, response, body) {
        console.log(error);
        console.log(response);
        console.log(body);
      }
    );
  };
  var promiseError = function(error) {
    console.log('Error in typesetting:');
    console.log(error);
    res.end(); // Empty 200 response.
  };
  typesetPromise.then(promiseSuccess, promiseError);
});
router.post('/slashtypeset', function(req, res) {
  var cd = new Date();
  var requestString = req.body.text;
  var typesetPromise = Typeset.typeset(requestString,'');
  if (typesetPromise === null) {
    res.send('no text found to typeset');
    res.end(); // Empty 200 response -- no text was found to typeset.
    return;
  }
  var promiseSuccess = function(mathObjects) {
    var locals = {'mathObjects': mathObjects,
                  'serverAddress': util.format('http://%s:%s/', SERVER, PORT)};
    var htmlResult = Jade.renderFile('./views/slack-slash-response.jade', locals);
    res.send(htmlResult);
    res.end();
  };
  var promiseError = function(error) {
    console.log('Error in typesetting:');
    console.log(error);
    res.end(); // Empty 200 response.
  };
  typesetPromise.then(promiseSuccess, promiseError);
});


// Start the server.
var app = Express();
app.use(BodyParser.urlencoded({extended: true}));
app.use(BodyParser.json());
app.use('/static', Express.static('static'));
app.use('/', router);

app.listen(PORT);
console.log("Mathslax is listening at http://%s:%s/", SERVER, PORT);
console.log("Make a test request with something like:");
console.log("curl -v -X POST '%s:%d/typeset' --data " +
            "'{\"text\": \"math! f(x) = x^2/sin(x) * E_0\"}' " +
            "-H \"Content-Type: application/json\"", SERVER, PORT);
console.log('___________\n');
