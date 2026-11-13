const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const passwordPolicy =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;

/*
    REGISTER
*/
const registerUser = async (req, res) => {

    try {

        const {
            first_name,
            middle_name,
            last_name,
            email,
            location_id,
            password
        } = req.body;

        const firstName =
            typeof first_name === "string" ? first_name.trim() : "";
        const middleName =
            typeof middle_name === "string" ? middle_name.trim() : "";
        const lastName =
            typeof last_name === "string" ? last_name.trim() : "";

        // Validate required fields
        if (
            !firstName ||
            !lastName ||
            !email ||
            typeof password !== "string" ||
            !password
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "First name, last name, email, and password are required."
            });

        }

        if (!passwordPolicy.test(password)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character."
            });
        }

        // Check if email already exists
        const [existingUsers] = await pool.query(
            `
            SELECT user_id
            FROM users
            WHERE email = ?
            `,
            [email]
        );


        if (existingUsers.length > 0) {

            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists."
            });

        }


        // Hash password
        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Create user
        const [result] = await pool.query(
            `
            INSERT INTO users (
                first_name,
                middle_name,
                last_name,
                email,
                password,
                location_id
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                firstName,
                middleName || null,
                lastName,
                email,
                hashedPassword,
                location_id || null
            ]
        );


        res.status(201).json({

            success: true,

            message:
                "Account created successfully.",

            user: {
                user_id: result.insertId,
                first_name: firstName,
                middle_name: middleName || null,
                last_name: lastName,
                full_name: [
                    firstName,
                    middleName,
                    lastName
                ].filter(Boolean).join(" "),
                email,
                location_id:
                    location_id || null
            }

        });


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to create account."

        });

    }

};


/*
    LOGIN
*/
const loginUser = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // Validate fields
        if (
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required."

            });

        }


        // Find user
        const [users] = await pool.query(
            `
            SELECT
    user_id,
                first_name,
                middle_name,
                last_name,
                CONCAT_WS(' ', first_name, NULLIF(middle_name, ''), last_name) AS full_name,
                email,
    password,
    role,
    location_id
FROM users
WHERE email = ?
            `,
            [email]
        );


        if (users.length === 0) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }


        const user = users[0];


        // Compare password
        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password."

            });

        }
        
        const token = jwt.sign(
    {
        user_id: user.user_id,
        email: user.email,
        role: user.role
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "2h"
    }
);


        // Do NOT send password to frontend
        res.json({

    success: true,

    message:
        "Login successful.",

    token,

    user: {

    user_id:
        user.user_id,

    first_name: user.first_name,
    middle_name: user.middle_name,
    last_name: user.last_name,
    full_name: user.full_name,

    email:
        user.email,

    role:
        user.role,

    location_id:
        user.location_id

}

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to login."

        });

    }

};


/*
    GET ALL USERS
*/
const getAllUsers = async (req, res) => {

    try {

        const [users] = await pool.query(
            `
            SELECT
                u.user_id,
                u.first_name,
                u.middle_name,
                u.last_name,
                CONCAT_WS(
                    ' ',
                    u.first_name,
                    NULLIF(u.middle_name, ''),
                    u.last_name
                ) AS full_name,
                u.email,
                u.role,
                u.location_id,
                l.location_name,
                u.created_at
            FROM users u
            LEFT JOIN locations l
                ON u.location_id = l.location_id
            ORDER BY u.created_at DESC
            `
        );

        res.json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {

        console.error(
            "User retrieval error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to retrieve users."
        });

    }

};

module.exports = {
    registerUser,
    loginUser,
    getAllUsers
};
