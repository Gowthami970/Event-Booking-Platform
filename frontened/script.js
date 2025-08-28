const eventsContainer = document.getElementById('events-container');
const eventSelect = document.getElementById('event-select');
const bookingForm = document.getElementById('booking-form');
const bookingMessage = document.getElementById('booking-message');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const historyContainer = document.getElementById('history-container');

let events = [];

// Fetch events
fetch('http://localhost:3000/events')
  .then(res => res.json())
  .then(data => {
    events = data;
    renderEvents();
    populateEventSelect();
  });

// Render events
function renderEvents() {
  let filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchInput.value.toLowerCase())
  );

  if(sortSelect.value === 'asc') filteredEvents.sort((a,b)=>new Date(a.date)-new Date(b.date));
  if(sortSelect.value === 'desc') filteredEvents.sort((a,b)=>new Date(b.date)-new Date(a.date));

  eventsContainer.innerHTML = '';
  filteredEvents.forEach(event => {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `
      <img src="${event.image}" alt="${event.name}">
      <h3>${event.name}</h3>
      <p><strong>Date:</strong> ${event.date} ${event.time}</p>
      <p><strong>Category:</strong> ${event.category}</p>
      <p>${event.description}</p>
      <p><strong>Seats Remaining:</strong> ${event.seats}</p>
      <p><strong>Rating:</strong> ${'⭐'.repeat(event.rating)}</p>
      <button onclick="markFavorite('${event.id}')">❤ Favorite</button>
      <input type="number" min="1" max="5" id="rate-${event.id}" placeholder="Rate 1-5">
      <button onclick="giveRating('${event.id}')">Rate</button>
    `;
    eventsContainer.appendChild(card);
  });
}

// Populate select
function populateEventSelect() {
  eventSelect.innerHTML = '';
  events.forEach(event => {
    const option = document.createElement('option');
    option.value = event.id;
    option.textContent = event.name;
    eventSelect.appendChild(option);
  });
}

// Search & Sort listeners
searchInput.addEventListener('input', renderEvents);
sortSelect.addEventListener('change', renderEvents);

// Booking form
bookingForm.addEventListener('submit', e => {
  e.preventDefault();
  const selectedEvent = eventSelect.value;
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();

  if(!name || !email){
    bookingMessage.textContent = 'Fill all fields!';
    bookingMessage.style.color='red';
    return;
  }

  const eventObj = events.find(e=>e.id===selectedEvent);
  if(eventObj.seats <=0){
    bookingMessage.textContent = 'No seats available!';
    bookingMessage.style.color='red';
    return;
  }

  fetch('http://localhost:3000/bookings',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({eventId:selectedEvent,name,email})
  })
  .then(res=>res.json())
  .then(data=>{
    bookingMessage.textContent = `Booking Successful! ID: ${data.booking.id}`;
    bookingMessage.style.color='green';
    bookingForm.reset();
    eventObj.seats -=1;
    renderEvents();
    addBookingToHistory(data.booking,email);
  })
  .catch(()=>{bookingMessage.textContent='Booking failed'; bookingMessage.style.color='red'});
});

// Booking history
function addBookingToHistory(booking,email){
  if(email===booking.email){
    const bookedEvent = events.find(e=>e.id===booking.eventId);
    const div = document.createElement('div');
    div.textContent = `Booking ID: ${booking.id} | Event: ${bookedEvent.name} | Date: ${bookedEvent.date}`;
    historyContainer.appendChild(div);
  }
}

// Favorite
function markFavorite(id){
  alert(`Event ${id} marked as favorite!`);
}

// Rating
function giveRating(id){
  const input = document.getElementById(`rate-${id}`);
  let val = parseInt(input.value);
  if(val>=1 && val<=5){
    const eventObj = events.find(e=>e.id===id);
    eventObj.rating = val;
    renderEvents();
  } else {
    alert('Rate between 1-5');
  }
}
