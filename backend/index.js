
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL
        }
        : {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        }
);

// Home route
app.get("/", (req, res) => {
    res.send("Campus Room Availability System API is running!");
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "success",
        message: "Backend server is working correctly."
    });
});

// Database test
app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                NOW() AS server_time,
                current_database() AS database_name,
                current_user AS database_user,
                inet_server_addr() AS server_address
        `);

        res.json({
            status: "success",
            message: "PostgreSQL connected successfully!",
            database: result.rows[0]
        });

    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            status: "error",
            message: "Database connection failed."
        });
    }
});

// Get all active rooms
app.get("/api/rooms", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM rooms WHERE is_active = TRUE ORDER BY room_id"
        );

        res.json({
            status: "success",
            count: result.rows.length,
            rooms: result.rows
        });
    } catch (error) {
        console.error("Rooms API error:", error.message);
        res.status(500).json({
            status: "error",
            message: "Could not fetch rooms."
        });
    }
});

// Create a booking request
app.post("/api/bookings", async (req, res) => {
    try {
        const {
            room_id,
            booking_date,
            start_time,
            end_time,
            purpose
        } = req.body;

        // Check required fields
        if (!room_id || !booking_date || !start_time || !end_time || !purpose) {
            return res.status(400).json({
                status: "error",
                message: "All booking fields are required."
            });
        }

        // Validate date format
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;

        if (!datePattern.test(booking_date)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid date format. Use YYYY-MM-DD."
            });
        }

        // Validate actual calendar date and reject past dates
        const requestedDate = new Date(booking_date + "T00:00:00Z");

        if (
            Number.isNaN(requestedDate.getTime()) ||
            requestedDate.toISOString().slice(0, 10) !== booking_date
        ) {
            return res.status(400).json({
                status: "error",
                message: "Please enter a valid calendar date."
            });
        }

        const today = new Date();
        const todayString =
            today.getFullYear() + "-" +
            String(today.getMonth() + 1).padStart(2, "0") + "-" +
            String(today.getDate()).padStart(2, "0");

        if (booking_date < todayString) {
            return res.status(400).json({
                status: "error",
                message: "Past dates are not allowed. Select today or a future date."
            });
        }

        // Validate time
        if (end_time <= start_time) {
            return res.status(400).json({
                status: "error",
                message: "End time must be later than start time."
            });
        }

        // Insert booking
        const result = await pool.query(
            `INSERT INTO bookings
            (room_id, user_id, booking_date, start_time, end_time, purpose)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [room_id, 1, booking_date, start_time, end_time, purpose]
        );

        res.status(201).json({
            status: "success",
            message: "Booking request submitted successfully!",
            booking: result.rows[0]
        });

    } catch (error) {
        if (error.code === "23P01") {
            return res.status(409).json({
                status: "error",
                message: "This room already has a pending or approved booking for that time."
            });
        }

        console.error("Booking API error:", error.message);

        res.status(500).json({
            status: "error",
            message: "Could not submit booking request."
        });
    }
});
// Get student booking history
app.get("/api/bookings", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                b.booking_id,
                r.room_name,
                r.building,
                b.booking_date,
                b.start_time,
                b.end_time,
                b.purpose,
                b.status,
                b.created_at
            FROM bookings b
            JOIN rooms r ON b.room_id = r.room_id
            WHERE b.user_id = $1
            ORDER BY b.created_at DESC`,
            [1]
        );

        res.json({
            status: "success",
            count: result.rows.length,
            bookings: result.rows
        });

    } catch (error) {
        console.error("Booking history error:", error.message);

        res.status(500).json({
            status: "error",
            message: "Could not fetch booking history."
        });
    }
});

// Admin: View all booking requests
app.get("/api/admin/bookings", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                b.booking_id,
                r.room_name,
                r.building,
                u.full_name,
                b.booking_date,
                b.start_time,
                b.end_time,
                b.purpose,
                b.status
            FROM bookings b
            JOIN rooms r ON b.room_id = r.room_id
            JOIN users u ON b.user_id = u.user_id
            ORDER BY b.created_at DESC
        `);

        res.json({
            status: "success",
            bookings: result.rows
        });

    } catch (error) {
        console.error("Admin booking error:", error.message);

        res.status(500).json({
            status: "error",
            message: "Could not fetch booking requests."
        });
    }
});

// Admin: Approve or reject a booking
app.patch("/api/admin/bookings/:id", async (req, res) => {
    try {
        const { status } = req.body;
        const bookingId = req.params.id;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid booking status."
            });
        }

        const result = await pool.query(
            `UPDATE bookings
             SET status = $1
             WHERE booking_id = $2
             RETURNING *`,
            [status, bookingId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Booking not found."
            });
        }

        res.json({
            status: "success",
            message: `Booking ${status} successfully.`,
            booking: result.rows[0]
        });

    } catch (error) {
        console.error("Admin update error:", error.message);

        res.status(500).json({
            status: "error",
            message: "Could not update booking."
        });
    }
});
// Check room availability
app.get("/api/availability", async (req, res) => {
    try {
        const { date, start_time, end_time } = req.query;

        if (!date || !start_time || !end_time) {
            return res.status(400).json({
                status: "error",
                message: "Date, start time and end time are required."
            });
        }

        if (end_time <= start_time) {
            return res.status(400).json({
                status: "error",
                message: "End time must be after start time."
            });
        }

        const result = await pool.query(`
            SELECT *
            FROM rooms r
            WHERE r.is_active = TRUE
            AND NOT EXISTS (
                SELECT 1
                FROM bookings b
                WHERE b.room_id = r.room_id
                AND b.booking_date = $1
                AND b.status IN ('pending', 'approved')
                AND b.start_time < $3
                AND b.end_time > $2
            )
            ORDER BY r.room_id
        `, [date, start_time, end_time]);

        res.json({
            status: "success",
            count: result.rows.length,
            availableRooms: result.rows
        });

    } catch (error) {
        console.error("Availability error:", error.message);
        res.status(500).json({
            status: "error",
            message: "Could not check room availability."
        });
    }
});
// Get room timetable for a selected date
app.get("/api/timetable", async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                status: "error",
                message: "Please provide a date."
            });
        }

        const result = await pool.query(`
            SELECT
                b.booking_id,
                r.room_name,
                r.building,
                r.room_type,
                b.booking_date,
                b.start_time,
                b.end_time,
                b.purpose,
                b.status
            FROM bookings b
            JOIN rooms r ON b.room_id = r.room_id
            WHERE b.booking_date = $1
            AND b.status IN ('pending', 'approved')
            ORDER BY r.room_name, b.start_time
        `, [date]);

        res.json({
            status: "success",
            count: result.rows.length,
            timetable: result.rows
        });

    } catch (error) {
        console.error("Timetable error:", error.message);

        res.status(500).json({
            status: "error",
            message: "Could not load timetable."
        });
    }
});
// Admin: Add a new room
app.post("/api/admin/rooms", async (req, res) => {
    try {
        const {
            room_name,
            building,
            capacity,
            room_type,
            facilities
        } = req.body;

        if (!room_name || !building || !capacity || !room_type) {
            return res.status(400).json({
                status: "error",
                message: "Please fill all required room details."
            });
        }

        if (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
            return res.status(400).json({
                status: "error",
                message: "Capacity must be a positive whole number."
            });
        }

        const result = await pool.query(
            `INSERT INTO rooms
             (room_name, building, capacity, room_type, facilities)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                room_name.trim(),
                building.trim(),
                Number(capacity),
                room_type,
                Array.isArray(facilities) ? facilities : []
            ]
        );

        res.status(201).json({
            status: "success",
            message: "Room added successfully.",
            room: result.rows[0]
        });

    } catch (error) {
        console.error("Add room error:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                status: "error",
                message: "A room with this name already exists."
            });
        }

        res.status(500).json({
            status: "error",
            message: "Could not add room."
        });
    }
});
// Admin: Update room details
app.put("/api/admin/rooms/:id", async (req, res) => {
    try {
        const { room_name, building, capacity, room_type, facilities } = req.body;
        const roomId = req.params.id;

        if (!room_name || !building || !capacity || !room_type) {
            return res.status(400).json({
                status: "error",
                message: "Please fill all required fields."
            });
           
        }

        if (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
            return res.status(400).json({
                status: "error",
                message: "Capacity must be a positive whole number."
            });
        }

        const result = await pool.query(
            `UPDATE rooms
             SET room_name = $1,
                 building = $2,
                 capacity = $3,
                 room_type = $4,
                 facilities = $5
             WHERE room_id = $6
             RETURNING *`,
            [
                room_name.trim(),
                building.trim(),
                Number(capacity),
                room_type,
                Array.isArray(facilities) ? facilities : [],
                roomId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "Room not found."
            });
        }

        res.json({
            status: "success",
            message: "Room updated successfully.",
            room: result.rows[0]
        });

    } catch (error) {
        console.error("Update room error:", error.message);

        if (error.code === "23505") {
            return res.status(409).json({
                status: "error",
                message: "A room with this name already exists."
            });
        }

        res.status(500).json({
            status: "error",
            message: "Could not update room."
        });
    }
});

app.patch("/api/admin/rooms/:id/deactivate", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `UPDATE rooms
             SET is_active = FALSE
             WHERE room_id = $1 AND is_active = TRUE
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Room not found or already inactive."
            });
        }

        res.json({
            message: "Room deactivated successfully.",
            room: result.rows[0]
        });

    } catch (error) {
        console.error("Deactivate room error:", error);

        res.status(500).json({
            message: "Could not deactivate room."
        });
    }
});

// Admin: Get all inactive rooms
app.get("/api/admin/rooms/inactive", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM rooms
             WHERE is_active = FALSE
             ORDER BY room_id`
        );

        res.json({
            status: "success",
            count: result.rows.length,
            rooms: result.rows
        });

    } catch (error) {
        console.error("Inactive rooms error:", error);

        res.status(500).json({
            message: "Could not fetch inactive rooms."
        });
    }
});


// Admin: Activate a room
app.patch("/api/admin/rooms/:id/activate", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `UPDATE rooms
             SET is_active = TRUE
             WHERE room_id = $1 AND is_active = FALSE
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Room not found or already active."
            });
        }

        res.json({
            status: "success",
            message: "Room activated successfully.",
            room: result.rows[0]
        });

    } catch (error) {
        console.error("Activate room error:", error);

        res.status(500).json({
            message: "Could not activate room."
        });
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
