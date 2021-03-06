require('dotenv').config();
const express = require('express');
const request = require('request');
const app = express();

app.post('/webhook', (req, res) => {
    // Parse the request body from the POST
  let body = req.body;
  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
        // Gets the body of the webhook event
        let webhook_event = entry.messaging[0];
        console.log(webhook_event);

        let url = `https://graph.facebook.com/${webhook_event.sender.id}?fields=first_name,last_name,profile_pic&access_token=${process.env.FB_TOKEN}`
        request({
            url: url,
            json: true
        }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
            console.log(body.first_name) // Print the json response
            }
        })
        // Get the sender PSID
        // let sender_psid = webhook_event.sender.id;
        // console.log('Sender PSID: ' + sender_psid);
        
        // // Check if the event is a message or postback and
        // // pass the event to the appropriate handler function
        // if (webhook_event.message) {
        //   handleMessage(sender_psid, webhook_event.message);        
        // } else if (webhook_event.postback) {
        //   handlePostback(sender_psid, webhook_event.postback);
        // }
    });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
})

app.get('/webhook', (req, res) => {

    let VERIFY_TOKEN = process.env.FB_TOKEN;

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {

        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
            
        } else {
            res.sendStatus(404);
        };
    };

});

// Handles messages events
function handleMessage(sender_psid, received_message) {
    let response;

    // Check if the message contains text
    if (received_message.text) {    

    // Create the payload for a basic text message
        response = {
        "text": `You sent the message: "${received_message.text}". Now send me an image!`
     } 
        
  }  else if (received_message.attachments) {
  
    // Gets the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the right picture?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              }
            ],
          }]
        }
      }
    }
  } 
  
    // Sends the response message
    callSendAPI(sender_psid, response); 
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
    let response;
  
    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    if (payload === 'yes') {
      response = { "text": "Thanks!" }
    } else if (payload === 'no') {
      response = { "text": "Oops, try sending another image." }
    }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": process.env.FB_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!');
      console.log(`response: ${response}`);
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

module.exports = app;