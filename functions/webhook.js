const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());  // To parse incoming JSON data

// Webhook endpoint for receiving Telnyx events
app.post('/webhook', (req, res) => {
  const event = req.body;  // The incoming event data from Telnyx

  // Log the incoming event data
  console.log('Received webhook event:', event);

  // Handle different call statuses

  // Check if the call was answered
  if (event.data && event.data.status === 'answered') {
    console.log(`Call answered! Call Control ID: ${event.data.call_control_id}`);
    // You can trigger actions like TTS, logging, or other events here
    // For example: trigger TTS with the callControlId
    // callControlId is available in event.data.call_control_id
  }

  // Check if the call is completed
  if (event.data && event.data.status === 'completed') {
    console.log(`Call completed! Call Control ID: ${event.data.call_control_id}`);
    // Handle post-call actions such as logging the completion time, generating reports, etc.
  }

  // Handle failed call status
  if (event.data && event.data.status === 'failed') {
    console.log(`Call failed! Call Control ID: ${event.data.call_control_id}`);
    // Handle failure, maybe notify the user or retry the call
    if (event.data.reason) {
      console.log(`Reason for failure: ${event.data.reason}`);
    }
  }

  // Respond with a 200 status to acknowledge receipt of the webhook
  res.status(200).send('Webhook received');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
