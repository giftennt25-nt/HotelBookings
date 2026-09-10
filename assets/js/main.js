

    // ------- ROOM DATA -------
    var rooms = [
      { code: 'R101', type: 'Deluxe Room',     price: 3500, maxGuests: 2 },
      { code: 'R102', type: 'Deluxe Room',     price: 3500, maxGuests: 2 },
      { code: 'R201', type: 'Executive Suite', price: 5800, maxGuests: 3 },
      { code: 'R202', type: 'Executive Suite', price: 5800, maxGuests: 3 },
      { code: 'R301', type: 'Family Room',     price: 4200, maxGuests: 4 }
    ];

    // ------- EXISTING BOOKINGS -------
    var existingBookings = [
      { roomCode: 'R101', checkin: '2026-09-15', checkout: '2026-09-18' },
      { roomCode: 'R201', checkin: '2026-09-10', checkout: '2026-09-12' }
    ];

    var selectedRoom = null;

    // ------- RENDER ROOMS -------
    function renderRooms() {

      var guestFilter = parseInt(
        document.getElementById('guestFilter').value
      );
      var checkin  = document.getElementById('checkin').value;
      var checkout = document.getElementById('checkout').value;
      var list = document.getElementById('roomList');
      list.innerHTML = '';

      var filtered = rooms.filter(function(room) {
        if (guestFilter === 0) return true;
        return room.maxGuests <= guestFilter;
      });

      filtered.forEach(function(room) {

        var isBooked   = checkRoomBooked(room.code, checkin, checkout);
        var isSelected = selectedRoom === room.code;

        var col = document.createElement('div');
        col.className = 'col-6';

        col.innerHTML =
          '<div class="room-card' +
            (isSelected ? ' selected' : '') +
            (isBooked   ? ' booked'   : '') +
          '" onclick="' +
            (isBooked ? '' : 'selectRoom(\'' + room.code + '\')') +
          '">' +

            '<div class="room-badge">' +
              '<i class="fas fa-bed"></i>' + room.code +
            '</div>' +

            '<div class="room-type">' + room.type + '</div>' +

            '<div class="room-price">₹' +
              room.price.toLocaleString() + ' / night' +
            '</div>' +

            '<div class="room-guests">' +
              '<i class="fas fa-users me-1"></i>' +
              'Max ' + room.maxGuests + ' guests' +
            '</div>' +

            (isSelected ?
              '<div class="mt-2"><span class="badge bg-primary">Selected</span></div>'
              : '') +

            (isBooked ?
              '<div class="mt-2"><span class="badge bg-danger">Already Booked</span></div>'
              : '') +

          '</div>';

        list.appendChild(col);
      });
    }

    // ------- CHECK BOOKED -------
    function checkRoomBooked(roomCode, checkin, checkout) {

      if (!checkin || !checkout) return false;

      var newIn  = new Date(checkin);
      var newOut = new Date(checkout);

      return existingBookings.some(function(b) {
        if (b.roomCode !== roomCode) return false;
        var bIn  = new Date(b.checkin);
        var bOut = new Date(b.checkout);
        return newIn < bOut && newOut > bIn;
      });
    }

    // ------- SELECT ROOM -------
    function selectRoom(code) {
      selectedRoom = code;
      renderRooms();
      hide('roomAlert');
      hide('summarySection');
      show('summaryPlaceholder');
    }

    // ------- DATE CHANGE -------
    function handleDateChange() {
      var checkin = document.getElementById('checkin').value;
      if (checkin) {
        document.getElementById('checkout').min = checkin;
      }
      renderRooms();
      hide('summarySection');
      show('summaryPlaceholder');
      hide('dateAlert');
    }

    // ------- VALIDATE -------
    function validateDates(checkin, checkout) {

      var today = new Date();
      today.setHours(0, 0, 0, 0);

      if (!checkin || !checkout) {
        return 'Please select both check-in and check-out dates.';
      }

      if (new Date(checkin) < today) {
        return 'Check-in date cannot be in the past.';
      }

      if (new Date(checkout) <= new Date(checkin)) {
        return 'Check-out date must be after check-in date.';
      }

      return null;
    }

    // ------- CALCULATE -------
    function calculateBooking() {

      var checkin  = document.getElementById('checkin').value;
      var checkout = document.getElementById('checkout').value;

      hide('dateAlert');
      hide('roomAlert');
      hide('summarySection');
      show('summaryPlaceholder');

      // Validate dates
      var dateMsg = validateDates(checkin, checkout);
      if (dateMsg) {
        showAlert('dateAlert', 'dateAlertMsg', dateMsg);
        return;
      }

      // Validate room
      if (!selectedRoom) {
        showAlert('roomAlert', 'roomAlertMsg',
          'Please select a room to continue.');
        return;
      }

      // Check double booking
      if (checkRoomBooked(selectedRoom, checkin, checkout)) {
        showAlert('roomAlert', 'roomAlertMsg',
          'This room is already booked for the selected dates. Please choose another room.');
        return;
      }

      // Get room
      var room = rooms.find(function(r) {
        return r.code === selectedRoom;
      });

      // Calculate
      var nights = Math.round(
        (new Date(checkout) - new Date(checkin)) /
        (1000 * 60 * 60 * 24)
      );
      var total = nights * room.price;

      // Fill summary
      document.getElementById('summaryRoom').textContent =
        room.code + ' — ' + room.type;

      document.getElementById('summaryCheckin').textContent =
        new Date(checkin).toDateString();

      document.getElementById('summaryCheckout').textContent =
        new Date(checkout).toDateString();

      document.getElementById('summaryNights').textContent =
        nights + (nights === 1 ? ' night' : ' nights');

      document.getElementById('summaryPricePerNight').textContent =
        '₹' + room.price.toLocaleString();

      document.getElementById('summaryTotal').textContent =
        '₹' + total.toLocaleString();

      show('summarySection');
      hide('summaryPlaceholder');
    }

    // ------- HELPERS -------
    function show(id) {
      document.getElementById(id).classList.remove('d-none');
    }

    function hide(id) {
      document.getElementById(id).classList.add('d-none');
    }

    function showAlert(alertId, msgId, msg) {
      document.getElementById(msgId).textContent = msg;
      show(alertId);
    }

    // ------- INIT -------
    function init() {
      var today = new Date().toISOString().split('T')[0];
      document.getElementById('checkin').min  = today;
      document.getElementById('checkout').min = today;
      renderRooms();
    }

    init();
