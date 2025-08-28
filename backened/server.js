const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Load data
let events = JSON.parse(fs.readFileSync('./events.json'));
let bookings = JSON.parse(fs.readFileSync('./bookings.json'));

// Get all events
app.get('/events', (req, res) => {
  res.json(events);
});

// Add new booking
app.post('/bookings', (req, res) => {
  const booking = req.body;
  booking.id = 'B' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  bookings.push(booking);

  // Save to JSON
  fs.writeFileSync('./bookings.json', JSON.stringify(bookings, null, 2));
  res.json({ message: 'Booking successful', booking });
});

// Admin: Add new event
app.post('/events', (req, res) => {
  const event = req.body;
  event.id = 'E' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  events.push(event);

  fs.writeFileSync('./events.json', JSON.stringify(events, null, 2));
  res.json({ message: 'Event added', event });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
