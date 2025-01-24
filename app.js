const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3"); 
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express(); 
app.use(express.json()); 
const dbPath = path.join(__dirname, "database.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath, 
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DataBase Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer(); // Initialize the database and start the server by calling the function

const cors = require("cors");
app.use(cors());

const authenticateToken = (request, response, next) => {
    let jwtToken=null;
    const authHeader = request.headers["authorization"];
    if (authHeader !== undefined) {
      jwtToken = authHeader.split(" ")[1]; // Extract the token part of the header (format: "Bearer <token>")
    }
    if (jwtToken === undefined) {
      response.status(401);
      response.send("Invalid JWT Token"); 
    } else {
      jwt.verify(jwtToken, "MY_SECRET_KEY", async (error, payload) => {
        if (error) {
          response.status(401); 
          response.send("Invalid JWT Token"); 
        } else {
          // If the token verification is successful, set the payload in the request object
          request.payload = payload;
          next(); // Pass control to the next middleware or route handler
        }
      });
    }
  };

  const adminAccess = (request, response, next) => {
    const { role } = request.payload;
    if (role !== "admin") {
      response.status(401);
      response.send("Access Denied");
    } else {
      next();
    }
  };

//Register API

app.post('/auth/register/', async (request, response) => {
    const { name, email, password, role } = request.body;
    try {
        const isUserExistsQuery = `SELECT * FROM users WHERE email = '${email}'`; // Check if the user already exists
        const isUserExists = await db.get(isUserExistsQuery, [email]); 
        if (isUserExists !== undefined) {
            response.status(404)
            response.send("User already exists");
        }
        // Validate password length
        else if (password.length < 5) {
            response.status(400)    
            response.send("Password is too short, contains at least 5 characters");
        }
        // Validate user role
        else if (role !== "admin" && role !== "regular") {
            response.status(400)
            response.send("Invalid user role");
        }
        else{
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            // Insert new user into the database
            const addUserQuery = `INSERT INTO users (name, email, password, role) VALUES ('${name}', '${email}', '${hashedPassword}', '${role}');`;
            await db.run(addUserQuery, [name, email, hashedPassword, role]);
            response.send("User created");
        }
    } catch (error) {
        response.status(500)
        response.send("Internal Server Error");
    }
});

// Login API

app.post('/auth/login/', async (request, response) => {
    const { email, password } = request.body;
    try {
        // Query to check if the user exists in the database based on the provided email
        const getUserQuery = `SELECT * FROM users WHERE email = '${email}';`;
        const user = await db.get(getUserQuery);// Execute the query
        if (user === undefined) {
            response.status(404);
            response.send("Invalid user"); 
        } else {
            // If the user exists, compare the provided password with the stored hashed password, 
            const hashedPassword = user.password;
            const isPasswordMatched = await bcrypt.compare(password, hashedPassword);
            // If the password matches, generate a JWT token and send it back
            if (isPasswordMatched === true) {
                const payload = {
                    id: user.id,
                    name: user.name,
                    email: email,
                    role: user.role
                };
                // Create a JWT token with the user payload and a secret key and send the JWT token as the response
                const jwtToken = jwt.sign(payload, "MY_SECRET_KEY");
                response.send(jwtToken);
            } else {
                // If the password does not match, return an error response
                response.status(400);
                response.send("Invalid Password");
            }
        }
    } catch (error) {
        // If there is any error during the process, catch and log the error
        response.status(500)
        response.send("Internal Server Error");
    }
});

//Get Customer API
app.get('/customers/', authenticateToken, async (request, response) => {
    const {offset=0, limit=20,order="ASC",company="",name="",phone="",email="",order_by="created_at"} = request.query;
    // Ensure default values for query parameters to prevent undefined variables
    try {
        const getCustomersQuery = `SELECT * FROM customers WHERE company LIKE '%${company}%' OR name LIKE '%${name}%' OR phone LIKE '${phone}' OR email LIKE '%${email}%' ORDER BY ${order_by} ${order} LIMIT ${limit} OFFSET ${offset};`;
        // Construct SQL query dynamically with filters and ordering, handling undefined inputs gracefully
        const customers = await db.all(getCustomersQuery);
        response.send(customers);
    }
    catch (error) {
        response.status(500)
        response.send("Internal Server Error");
    }
});

// Create Customer API
app.post('/customers/', authenticateToken, async (request, response) => {
    const {name, email, phone, company,user_id} = request.body;
    try{
        // Validate if the all the field is provided
        if (name === undefined) {
            response.status(400)
            response.send("Name is required");
        }
        else if (email === undefined) {
            response.status(400)
            response.send("Email is required");
        }
        else if (phone === undefined) {
            response.status(400)
            response.send("Phone is required");
        }
        else if (company === undefined) {
            response.status(400)
            response.send("Company is required");
        }
        else{
            // Check if a customer with the same email already exists
            const isCustomerExistsQuery = `SELECT * FROM customers WHERE email = '${email}';`;
            const isCustomerExists = await db.get(isCustomerExistsQuery); 
            if (isCustomerExists !== undefined) {
                response.status(400)
                response.send("Customer already exists");
            }
            else{
                // Insert a new customer into the database
                const addCustomerQuery = `INSERT INTO customers (name, email, phone, company, user_id) VALUES ('${name}', '${email}', '${phone}', '${company}', '${user_id}');`;
                const dbResponse=await db.run(addCustomerQuery);
                // Extract the ID of the newly added customer
                const customerId = dbResponse.lastID;
                // Send a success response with the new customer's ID
                response.send("Customer added successfully with id: "+customerId);
            }
        }
    }
    catch (error) {
        // Handle unexpected errors
        response.status(500)
        response.send("Internal Server Error");
    }
});

// Get Customer API By ID
app.get('/customers/:customerId/', authenticateToken, async (request, response) => {
    const {customerId} = request.params;
    try{
        // Retrieve customer details using the customer ID
        const getCustomerQuery = `SELECT * FROM customers WHERE id = ${customerId};`;
        const customer = await db.get(getCustomerQuery);
        response.send(customer);
    }
    catch (error) { 
        // Handle unexpected errors
        response.status(500)
        response.send("Internal Server Error");
    }
});

// Update Customer API
app.put('/customers/:customerId/', authenticateToken, async (request, response) => {
    const {customerId} = request.params;
    try{ 
        const getCustomerQuery = `SELECT * FROM customers WHERE id = ${customerId};`; // Check if the customer exists in the database
        const customer = await db.get(getCustomerQuery); // Execute the query
        if (customer === undefined) {
            response.status(400)
            response.send("Invalid Customer");
        }
        else{
            const {name, email, phone, company} = request.body;
            // Update customer details in the database
            const updateCustomerQuery = `UPDATE customers SET name = '${name}', email = '${email}', phone = '${phone}', company = '${company}', created_at = DATETIME('now', 'localtime') WHERE id = ${customerId};`;
            await db.run(updateCustomerQuery);
            response.send("Customer Details Updated");
        }
    }
    catch (error) {
        // Handle unexpected errors
        response.status(500)
        response.send("Internal Server Error");
    }
});

// Delete Customer API
app.delete('/customers/:customerId/', authenticateToken,adminAccess, async (request, response) => {
    const {customerId} = request.params;
    try{
        // Check if the customer exists in the database
        const getCustomerQuery = `SELECT * FROM customers WHERE id = ${customerId};`;
        const customer = await db.get(getCustomerQuery);
        if (customer === undefined) {
            response.status(400)
            response.send("Invalid Customer");
        }
        else{
            // Delete the customer from the database
            const deleteCustomerQuery = `DELETE FROM customers WHERE id = ${customerId};`;
            await db.run(deleteCustomerQuery);
            response.send("Customer Deleted"); 
        }
    }
    catch (error) {
        // Handle unexpected errors
        response.status(500)
        response.send("Internal Server Error");
    }
});    

module.exports = app;