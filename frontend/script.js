
const API_URL = "http://localhost:3000/api/rooms";

let allRooms = [];

async function loadRooms() {
    const grid = document.getElementById("roomGrid");

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to fetch rooms");
        }

        const data = await response.json();
        allRooms = data.rooms;

        updateStats(allRooms);
        displayRooms(allRooms);

    } catch (error) {
        grid.innerHTML = `
            <p>Could not load rooms. Make sure your backend is running.</p>
        `;
        console.error(error);
    }
}

function updateStats(rooms) {
    document.getElementById("totalRooms").textContent = rooms.length;

    document.getElementById("classrooms").textContent =
        rooms.filter(r => r.room_type === "Classroom").length;

    document.getElementById("labs").textContent =
        rooms.filter(r => r.room_type === "Computer Lab").length;

    document.getElementById("capacity").textContent =
        rooms.reduce((total, r) => total + r.capacity, 0);
}

function displayRooms(rooms) {
    const grid = document.getElementById("roomGrid");

    document.getElementById("roomCount").textContent =
        `${rooms.length} spaces found`;

    if (rooms.length === 0) {
        grid.innerHTML = "<p>No matching rooms found.</p>";
        return;
    }

    grid.innerHTML = rooms.map(room => `
        <article class="room-card">
            <div class="room-top">
                <span class="room-type">${room.room_type}</span>
                <span class="status-dot"></span>
            </div>

            <h3>${room.room_name}</h3>
            <p class="room-building">${room.building}</p>

            <div class="room-details">
                <span>👥 ${room.capacity} seats</span>
                <span>✓ Active room</span>
            </div>

            <div class="facilities">
                ${(room.facilities || []).map(f =>
                    `<span>${f}</span>`
                ).join("")}
            </div>

            <div class="room-card-actions">

    <button class="room-action"
        onclick="requestBooking(${room.room_id})">
        Request booking
    </button>

    <button class="edit-room-btn"
        onclick="editRoom(${room.room_id})">
        Edit Room
    </button>

<div class="room-card-actions">

    <button class="room-action"
        onclick="requestBooking(${room.room_id})">
        Request booking
    </button>

    <button class="edit-room-btn"
        onclick="editRoom(${room.room_id})">
        Edit Room
    </button>

    <button class="deactivate-room-btn"
        onclick="deactivateRoom(${room.room_id})">
        Deactivate Room
    </button>

</div>


</div>
        </article>
    `).join("");
}


function displayRooms(rooms) {
    const grid = document.getElementById("roomGrid");

    document.getElementById("roomCount").textContent =
        `${rooms.length} spaces found`;

    if (rooms.length === 0) {
        grid.innerHTML = "<p>No matching rooms found.</p>";
        return;
    }

    grid.innerHTML = rooms.map(room => `
        <article class="room-card">

            <div class="room-top">
                <span class="room-type">${room.room_type}</span>
                <span class="status-dot"></span>
            </div>

            <h3>${room.room_name}</h3>
            <p class="room-building">${room.building}</p>

            <div class="room-details">
                <span>👥 ${room.capacity} seats</span>
                <span>✓ Active room</span>
            </div>

            <div class="facilities">
                ${(room.facilities || []).map(f =>
                    `<span>${f}</span>`
                ).join("")}
            </div>

            <div class="room-card-actions">

                <button class="room-action"
                    onclick="requestBooking(${room.room_id})">
                    Request Booking
                </button>

                <button class="edit-room-btn"
                    onclick="editRoom(${room.room_id})">
                    Edit Room
                </button>

                <button class="deactivate-room-btn"
                    onclick="deactivateRoom(${room.room_id})">
                    Deactivate Room
                </button>

            </div>
        </article>
    `).join("");
}

async function requestBooking(roomId) {
    const bookingDate = prompt("Enter booking date (YYYY-MM-DD):");
    if (!bookingDate) return;

    const startTime = prompt("Enter start time (HH:MM):");
    if (!startTime) return;

    const endTime = prompt("Enter end time (HH:MM):");
    if (!endTime) return;

    const purpose = prompt("Enter booking purpose:");
    if (!purpose) return;

    try {
        const response = await fetch(
            "http://localhost:3000/api/bookings",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    room_id: roomId,
                    booking_date: bookingDate,
                    start_time: startTime,
                    end_time: endTime,
                    purpose: purpose
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            alert("Booking request submitted successfully!");

            await loadBookings();
            await loadAdminBookings();

            const timetableDate =
                document.getElementById("timetableDate").value;

            if (timetableDate) {
                await loadTimetable();
            }

        } else {
            alert(data.message || "Booking failed.");
        }

    } catch (error) {
        console.error("Booking error:", error);
        alert("Unable to connect to the server.");
    }
}



document.getElementById("search")
    .addEventListener("input", filterRooms);

document.getElementById("typeFilter")
    .addEventListener("change", filterRooms);

// Load student booking history
async function loadBookings() {
    const history = document.getElementById("bookingHistory");
    const count = document.getElementById("bookingCount");

    try {
        const response = await fetch("http://localhost:3000/api/bookings");

        if (!response.ok) {
            throw new Error("Unable to fetch bookings");
        }

        const data = await response.json();
        const bookings = data.bookings;

        count.textContent = `${bookings.length} bookings`;

        if (bookings.length === 0) {
            history.innerHTML = "<p>No bookings found yet.</p>";
            return;
        }

        history.innerHTML = bookings.map(booking => {
            const date = String(booking.booking_date).slice(0, 10);

            return `
                <article class="booking-card">
                    <div>
                        <h3>${booking.room_name}</h3>
                        <p>${booking.building}</p>
                        <p>Booking ID: #${booking.booking_id}</p>
                        <p>Date: ${date}</p>
                        <p>Time: ${booking.start_time.slice(0, 5)} - ${booking.end_time.slice(0, 5)}</p>
                        <p>Purpose: ${booking.purpose}</p>
                    </div>

                    <span class="booking-status ${booking.status}">
                        ${booking.status.toUpperCase()}
                    </span>
                </article>
            `;
        }).join("");

    } catch (error) {
        console.error("Booking history error:", error);
        history.innerHTML = "<p>Could not load bookings. Check your backend.</p>";
        count.textContent = "Unavailable";
    }
}
// Load all booking requests for admin
async function loadAdminBookings() {
    const adminList = document.getElementById("adminBookingList");

    try {
        const response = await fetch("http://localhost:3000/api/admin/bookings");
        const data = await response.json();

        if (!response.ok) {
            throw new Error("Could not load admin bookings");
        }

        if (data.bookings.length === 0) {
            adminList.innerHTML = "<p>No booking requests available.</p>";
            return;
        }

        adminList.innerHTML = data.bookings.map(booking => `
            <article class="admin-booking-card">
                <div>
                    <h3>${booking.room_name}</h3>
                    <p>${booking.building} | ${booking.full_name}</p>
                    <p>Date: ${String(booking.booking_date).slice(0, 10)}</p>
                    <p>Time: ${booking.start_time.slice(0, 5)} - ${booking.end_time.slice(0, 5)}</p>
                    <p>Purpose: ${booking.purpose}</p>
                    <p>Status: <strong>${booking.status.toUpperCase()}</strong></p>
                </div>

                ${booking.status === "pending" ? `
                    <div class="admin-actions">
                        <button class="approve-btn"
                            onclick="changeBookingStatus(${booking.booking_id}, 'approved')">
                            Approve
                        </button>

                        <button class="reject-btn"
                            onclick="changeBookingStatus(${booking.booking_id}, 'rejected')">
                            Reject
                        </button>
                    </div>
                ` : ""}
            </article>
        `).join("");

    } catch (error) {
        console.error("Admin dashboard error:", error);
        adminList.innerHTML = "<p>Could not load booking requests.</p>";
    }
}


// Approve or reject a booking
async function changeBookingStatus(id, status) {
    try {
        const response = await fetch(
            `http://localhost:3000/api/admin/bookings/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: status })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Could not update booking.");
            return;
        }

        alert(data.message);

        loadAdminBookings();
        loadBookings();

    } catch (error) {
        console.error("Booking update error:", error);
        alert("Backend connection failed.");
    }
}
loadRooms();
// Check available rooms
async function checkAvailability() {
    const date = document.getElementById("availabilityDate").value;
    const startTime = document.getElementById("availabilityStart").value;
    const endTime = document.getElementById("availabilityEnd").value;

    const results = document.getElementById("availabilityResults");

    if (!date || !startTime || !endTime) {
        alert("Please select date, start time and end time.");
        return;
    }

    if (startTime >= endTime) {
        alert("End time must be after start time.");
        return;
    }

    results.innerHTML = "<p>Checking availability...</p>";

    try {
        const response = await fetch(
            `http://localhost:3000/api/availability?date=${date}&start_time=${startTime}&end_time=${endTime}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Availability check failed.");
        }

        if (data.availableRooms.length === 0) {
            results.innerHTML = "<p>No rooms are available for this time.</p>";
            return;
        }

        results.innerHTML = `
            <h3>${data.count} rooms available</h3>
            <div class="availability-grid">
                ${data.availableRooms.map(room => `
                    <article class="booking-card">
                        <div>
                            <h3>${room.room_name}</h3>
                            <p>${room.building}</p>
                            <p>Capacity: ${room.capacity}</p>
                            <p>Type: ${room.room_type}</p>
                        </div>
                    </article>
                `).join("")}
            </div>
        `;

    } catch (error) {
        console.error("Availability error:", error);
        results.innerHTML = `<p>${error.message}</p>`;
    }
}
// Load room timetable
async function loadTimetable() {
    const date = document.getElementById("timetableDate").value;
    const results = document.getElementById("timetableResults");

    if (!date) {
        alert("Please select a date.");
        return;
    }

    results.innerHTML = "<p>Loading timetable...</p>";

    try {
        const response = await fetch(
            `http://localhost:3000/api/timetable?date=${date}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not load timetable.");
        }

        if (data.timetable.length === 0) {
            results.innerHTML = "<p>No bookings scheduled for this date.</p>";
            return;
        }

        results.innerHTML = `
            <div class="timetable-list">
                ${data.timetable.map(booking => `
                    <article class="timetable-card">
                        <div>
                            <h3>${booking.room_name}</h3>
                            <p>Date: ${String(booking.booking_date).slice(0, 10)}</p>
                            <p>${booking.building} | ${booking.room_type}</p>
                            <p>
                                ${booking.start_time.slice(0, 5)}
                                - ${booking.end_time.slice(0, 5)}
                            </p>
                            <p>Purpose: ${booking.purpose}</p>
                        </div>

                        <span class="booking-status ${booking.status}">
                            ${booking.status.toUpperCase()}
                        </span>
                    </article>
                `).join("")}
            </div>
        `;

    } catch (error) {
        console.error("Timetable error:", error);
        results.innerHTML = `<p>${error.message}</p>`;
    }
}

async function editRoom(roomId) {
    const room = allRooms.find(r => r.room_id === roomId);

    if (!room) {
        alert("Room not found.");
        return;
    }

    const roomName = prompt("Enter room name:", room.room_name);
    if (roomName === null) return;

    const building = prompt("Enter building:", room.building);
    if (building === null) return;

    const capacity = prompt("Enter capacity:", room.capacity);
    if (capacity === null) return;

    const roomType = prompt("Enter room type:", room.room_type);
    if (roomType === null) return;

    const facilities = prompt(
        "Enter facilities separated by commas:",
        (room.facilities || []).join(", ")
    );
    if (facilities === null) return;

    const updatedRoom = {
        room_name: roomName.trim(),
        building: building.trim(),
        capacity: Number(capacity),
        room_type: roomType.trim(),
        facilities: facilities
            .split(",")
            .map(item => item.trim())
            .filter(item => item !== "")
    };

    if (
        !updatedRoom.room_name ||
        !updatedRoom.building ||
        !updatedRoom.room_type ||
        !Number.isInteger(updatedRoom.capacity) ||
        updatedRoom.capacity <= 0
    ) {
        alert("Please enter valid room details.");
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3000/api/admin/rooms/${roomId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedRoom)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Could not update room.");
            return;
        }

        alert("Room updated successfully!");
        await loadRooms();

    } catch (error) {
        console.error("Edit room error:", error);
        alert("Backend connection failed.");
    }
}

async function deactivateRoom(roomId) {
    const room = allRooms.find(r => r.room_id === roomId);

    if (!room) {
        alert("Room not found.");
        return;
    }

    const confirmDeactivate = confirm(
        `Are you sure you want to deactivate ${room.room_name}?`
    );

    if (!confirmDeactivate) return;

    try {
        const response = await fetch(
            `http://localhost:3000/api/admin/rooms/${roomId}/deactivate`,
            {
                method: "PATCH"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Could not deactivate room.");
            return;
        }

        alert("Room deactivated successfully!");

        await loadRooms();
        await loadInactiveRooms();

    } catch (error) {
        console.error("Deactivate room error:", error);
        alert("Backend connection failed.");
    }
}

// Load all inactive rooms
async function loadInactiveRooms() {
    const list = document.getElementById("inactiveRoomList");

    try {
        const response = await fetch(
            "http://localhost:3000/api/admin/rooms/inactive"
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not load inactive rooms.");
        }

        if (data.rooms.length === 0) {
            list.innerHTML = "<p>No inactive rooms found.</p>";
            return;
        }

        list.innerHTML = data.rooms.map(room => `
            <article class="inactive-room-card">
                <div>
                    <h4>${room.room_name}</h4>
                    <p>${room.building} | ${room.capacity} seats</p>
                    <p>Inactive</p>
                </div>

                <button class="activate-room-btn"
                    onclick="activateRoom(${room.room_id})">
                    Activate Room
                </button>
            </article>
        `).join("");

    } catch (error) {
        console.error("Inactive rooms error:", error);
        list.innerHTML = "<p>Could not load inactive rooms.</p>";
    }
}


// Activate an inactive room
async function activateRoom(roomId) {
    const confirmed = confirm(
        "Are you sure you want to activate this room?"
    );

    if (!confirmed) return;

    try {
        const response = await fetch(
            `http://localhost:3000/api/admin/rooms/${roomId}/activate`,
            {
                method: "PATCH"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Could not activate room.");
            return;
        }

        alert("Room activated successfully!");

        await loadRooms();
        await loadInactiveRooms();

    } catch (error) {
        console.error("Activate room error:", error);
        alert("Backend connection failed.");
    }
}


function filterRooms() {
    const search = document.getElementById("search")
        .value.toLowerCase();

    const type = document.getElementById("typeFilter").value;

    const filtered = allRooms.filter(room =>
        (
            room.room_name.toLowerCase().includes(search) ||
            room.building.toLowerCase().includes(search)
        ) &&
        (!type || room.room_type === type)
    );

    displayRooms(filtered);
}

loadBookings();
loadAdminBookings();
loadInactiveRooms();
// Add a new room from Admin Dashboard
document.getElementById("addRoomForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const message = document.getElementById("addRoomMessage");

    const roomData = {
        room_name: document.getElementById("newRoomName").value.trim(),
        building: document.getElementById("newBuilding").value.trim(),
        capacity: Number(document.getElementById("newCapacity").value),
        room_type: document.getElementById("newRoomType").value,
        facilities: document.getElementById("newFacilities").value
            .split(",")
            .map(item => item.trim())
            .filter(item => item !== "")
    };

    try {
        const response = await fetch("http://localhost:3000/api/admin/rooms", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(roomData)
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Could not add room.";
            return;
        }

        message.textContent = "Room added successfully!";
        message.style.color = "#15803d";

        document.getElementById("addRoomForm").reset();

        await loadRooms();

    } catch (error) {
        console.error("Add room error:", error);
        message.textContent = "Backend connection failed.";
        message.style.color = "#dc2626";
    }
});
