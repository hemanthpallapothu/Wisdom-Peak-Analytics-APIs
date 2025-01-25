
# User Management API

This project is a **User Management API** built using **Node.js**, **Express**, **SQLite**, and **JWT Authentication**. It provides essential features for user authentication, registration, login, and customer management with role-based access control. The API allows both users and admins to interact with customer data securely.

---

## Deployed Links

- **API**: [https://wisdom-peak-analytics-three.vercel.app/](https://wisdom-peak-analytics-three.vercel.app/)
- **Documentation**: [https://documentation.ccbp.tech/](https://documentation.ccbp.tech/)

---

## Features

- **User Registration**: Allows users to register with email, password, and a role (`admin` or `regular`).
- **User Login**: Provides JWT-based authentication for login.
- **Customer Management**: Admins can perform CRUD operations (Create, Read, Update, Delete) on customer records.
- **Role-Based Access Control**: Only `admin` users can perform certain actions, like deleting customers.
- **JWT Authentication**: Protects API endpoints and secures user data.

## Technologies Used

- **Node.js**: JavaScript runtime for server-side development.
- **Express.js**: Framework to build RESTful APIs.
- **SQLite**: Lightweight database to store user and customer data.
- **JWT (JSON Web Tokens)**: Token-based authentication for secure communication.
- **bcrypt**: Library to securely hash passwords.
- **CORS**: Middleware to allow cross-origin requests.

## Project Setup

### 1. Clone the repository:
First, clone the repository to your local machine using the following command:
```bash
git clone https://github.com/hemanthpallapothu/user-management-api.git
```

### 2. Install dependencies:
Navigate to the project folder and install all the required dependencies:
```bash
cd user-management-api
npm install
```

### 3. Database Setup:
Make sure you have the `database.db` file in the project directory. This file will store the data for users and customers. If you don't have it, the project will attempt to create it during the first run.

### 4. Start the Server:
Run the server locally by executing the following command:
```bash
npm start
```

The API will start on `http://localhost:3000/`.

## API Endpoints

### 1. **POST /auth/register**
Registers a new user.

#### Request Body:
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "admin/regular"
}
```

#### Response:
- 200: `"User created"`
- 400: `"Password is too short"`
- 404: `"User already exists"`
- 500: `"Internal Server Error"`

---

### 2. **POST /auth/login**
Logs in an existing user and generates a JWT token.

#### Request Body:
```json
{
  "email": "string",
  "password": "string"
}
```

#### Response:
- 200: Returns a JWT token
- 404: `"Invalid user"`
- 400: `"Invalid Password"`
- 500: `"Internal Server Error"`

---

### 3. **GET /customers**
Fetches a list of customers with optional filters.

#### Query Parameters:
- `offset`: Number of records to skip (default: `0`)
- `limit`: Number of records to fetch (default: `20`)
- `order`: Sorting order (`ASC/DESC`, default: `ASC`)
- `company`: Filter by company
- `name`: Filter by name
- `phone`: Filter by phone
- `email`: Filter by email
- `order_by`: Sort by field (default: `created_at`)

#### Response:
- 200: Array of customer objects
- 500: `"Internal Server Error"`

---

### 4. **POST /customers**
Creates a new customer.

#### Request Body:
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "company": "string",
  "user_id": "integer"
}
```

#### Response:
- 200: `"Customer added successfully"`
- 400: `"Missing required fields"`
- 400: `"Customer already exists"`
- 500: `"Internal Server Error"`

---

### 5. **GET /customers/:customerId**
Fetches customer details by customer ID.

#### Response:
- 200: Customer object
- 400: `"Invalid Customer"`
- 500: `"Internal Server Error"`

---

### 6. **PUT /customers/:customerId**
Updates an existing customer's details.

#### Request Body:
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "company": "string"
}
```

#### Response:
- 200: `"Customer Details Updated"`
- 400: `"Invalid Customer"`
- 500: `"Internal Server Error"`

---

### 7. **DELETE /customers/:customerId**
Deletes a customer (only accessible by `admin` users).

#### Response:
- 200: `"Customer Deleted"`
- 400: `"Invalid Customer"`
- 500: `"Internal Server Error"`

---

## Authentication

All protected routes require a **JWT token**. The token must be sent in the `Authorization` header with the format:
```
Authorization: Bearer <JWT_Token>
```

### How to Obtain a JWT Token:
1. First, register a new user using the `/auth/register` endpoint.
2. Then, log in using the `/auth/login` endpoint to receive a JWT token.

---

## Error Handling

- If a JWT token is invalid or expired, the server will return a `401 Unauthorized` status with the message `"Invalid JWT Token"`.
- If any other error occurs during processing, the server will respond with a `500 Internal Server Error` status.

---

## Deployment

You can deploy this API to cloud services like **Heroku**, **Vercel**, or any cloud platform that supports Node.js applications. For deploying on platforms like **Vercel**:

1. Push your project to a GitHub repository.
2. Link the repository to Vercel.
3. Set up the necessary environment variables, if required (e.g., `MY_SECRET_KEY`).

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact

Hemanth Pallapothu  
[GitHub Profile](https://github.com/hemanthpallapothu)
