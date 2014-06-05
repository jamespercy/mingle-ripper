var express = require('express');
var http = require('http');
var DOMParser = require('xmldom').DOMParser;
var _ = require('underscore')._;
var fs = require('fs');
var jsdom = require("jsdom");

var app = express();

app.use(express.static(__dirname + '/'));

app.get('/cards', function(req, res){

	var fetchedCards = [];
	
    console.log(req.query.card);
    var user = req.query.username;
    var password = req.query.password;

	var cerCardUrl = '/projects/rec_registry_redesign/cards/';
	var options = {
	  host: 'mingle',
	  auth: user + ':' + password,
	  port: '8081'
	};



	//fetch the cards
	for (card in req.query.card) {
		console.log('requesting card: ' + cerCardUrl + req.query.card[card] + '.xml');
		options.path = cerCardUrl + req.query.card[card];
		http.request(options, 

				function(response) {
					var str = '';
					//another chunk of data has been recieved, so append it to `str`
					response.on('data', function (chunk) {
						str += chunk;
					});
					//the whole response has been recieved, so we just print it out here
					response.on('end', function () {

						jsdom.env(str, function (errors, window) {
						  var cardSection = window.document.querySelector('#card')

						fs.writeFile('./ripped/' + req.query.card[card] + '.html', cardSection.innerHTML, function(err) {
						        console.log( (err) ? err : req.query.card[card] + ".html was saved!");
						});

						console.log(cardSection.innerHTML);
						fetchedCards.push(cardSection.innerHTML);
						if (fetchedCards.length === req.query.card.length) {
							fetchedCards.sort();
							res.set('Access-Control-Allow-Origin', 'http://localhost:9000');
				  			res.set('Access-Control-Allow-Methods', 'GET, POST');
				  			res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
							res.send(fetchedCards);
						}

						  window.close();
						});



				  });
				}

			).end();
	}

});

var server = app.listen(9000, function() {
    console.log('Listening on port %d', server.address().port);
});