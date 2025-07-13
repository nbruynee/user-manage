📌 User Management + Microservices Integration Platform

📝 Project Introduction
-----------------------------------------------------------------------------------------------------------------------

This project is a mini user management system, designed and implemented as part of a Backend internship. The system includes user profile management, secure authentication, role-based access control (RBAC), and microservice architecture integration with a mock notification service.
The main goal is to demonstrate good engineering practices, clean architecture, and interoperability between services.

✨ Key Features
-----------------------------------------------------------------------------------------------------------------------
✅ Functional Requirements
-----------------------------------------------------------------------------------------------------------------------
Authentication & Authorization:
- Secure user registration and login.
- Strong password hashing (using bcrypt).
- JWT (JSON Web Tokens) based authentication.
- Role-based access control (RBAC) with two roles: 'admin' and 'user'.
- Admin can view, update, or delete any user profile.
- Users can only access and update their own profiles.
User Management API: RESTful endpoints for user CRUD operations.
Email & SMS Notification Service (Mock Microservice Integration):
- A separate service that simulates sending emails/SMS when a user registers, logs in, or updates a profile.
- Includes retry and failure logging.
Audit Logging:
- Generate audit logs for each important action (user_id, action, timestamp, status, request_meta).

🧱 Non-Functional Requirements
-----------------------------------------------------------------------------------------------------------------------
Clean / layered architecture.

Environment configuration via .env file.
Protect sensitive data in logs.
Handling exceptions (validation, 404s, 401s, 500s).
Git version control (clean commits).

🚀 Quick Start
-----------------------------------------------------------------------------------------------------------------------
You can run the entire system using Docker Compose or manually run each Node.js service.

🐳 Running with Docker Compose (Recommended)
-----------------------------------------------------------------------------------------------------------------------
Make sure you have Docker Desktop (or Docker Engine) installed and running.

1. Clone the Repository / Extract the file:
```bash
git clone https://github.com/nbruynee/user-manage.git
```
or extract the ZIP file

2. Navigate to the project directory:
```bash
cd User Management Project
```

3. Create an environment variable file:
```bash
cp .env.example .env
cp notification-service/.env.example notification-service/.env
```
Open the .env and notification-service/.env files (in the 'notification-service/' directory).
Update the value for 'JWT_ACCESS_KEY' with a unique, strong, random string.

4. Launch the services
First run (to build Docker images and launch):
```bash
docker-compose up --build -d
``` 
Subsequent runs (if no changes to Dockerfile/dependencies):
```bash
docker-compose up -d
```
To view logs of all services:
```bash
docker-compose logs -f
```

5. Access the API:
Main Backend: 'http://localhost:8081'
Notification Service: 'http://localhost:8082' (endpoint: '/send')

💻 Run manually (Without Docker)
-----------------------------------------------------------------------------------------------------------------------
1. Navigate to the project directory:
```bash
cd User Management Project
```

2. Install dependencies for the Main Backend
```bash
npm install
```

3. Install dependencies for Notification Service
```bash
cd notification-service
npm install
# Go back to the root directory
cd ..
```

4. Create an environment variable file:(Similar to step 3 in Docker Compose)
```bash
cp .env.example .env
cp notification-service/.env.example notification-service/.env
```
Update 'JWT_ACCESS_KEY' and other values in the .env files.

5. Launch the Main Backend
```bash
cd User Management Project

node src/server.js
```

6. Launch the Notification Service
Open another terminal.
```bash
cd User Management Project/notification-service

node app.js
```
7. Access the API: (Similar to Docker Compose)

📚 API Documentation
-----------------------------------------------------------------------------------------------------------------------
The system provides the following RESTful endpoints:

Authentication & Authorization
'POST /v1/auth/register'
-----------------------------------------------------------------------------------------------------------------------
Description: Registers a new user to the system.
Body (JSON): 
{ 
    "email": "user@example.com", 
    "password": "123456789", 
    "name": "User Name", 
    "phone": "0123456789" 
}

Response (Success - 201 Created): 
{ 
    "message": "Register successful", 
    "user": 
        { 
            "id": "[USER_ID]", 
            "email": "user@example.com", 
            "role": "user", 
            "profile": { 
                "name": "User Name", 
                "phone": "0123456789" 
            }     
        } 
}

Response (Failure - 400 Bad Request): 
{ "message": "Email and password are required!" } 
{ "message": "Email user@example.com already exists!" }

'POST /v1/auth/login'
-----------------------------------------------------------------------------------------------------------------------
Description: Logs in the user and gets the JWT Access Token.
Body (JSON): 
{ 
    "email": "user@example.com", 
    "password": "password123" 
}

Response (Success - 200 OK): 
{ 
    "id": "[USER_ID]", 
    "email": "user@example.com", 
    "role": "user", 
    "profile": { 
        "name": "User Name", 
        "phone": "0123456789" 
    }, 
    "createdAt": "YYYY-MM-DDTHH:MM:SS.sssZ", 
    "updatedAt": "YYYY-MM-DDTHH:MM:SS.sssZ", 
    "message": "Login successful", 
    "accessToken": "[ACCESS_TOKEN_STRING]" 
}

Response (Failure - 404 Not Found / 400 Bad Request): 
{ "message": "Invalid email!" } 
{ "message": "Invalid password!" }

User Management
(All of the following endpoints require a JWT Access Token in the header: 'Authorization: Bearer <ACCESS_TOKEN>')
-----------------------------------------------------------------------------------------------------------------------
'GET /v1/users/me'
-----------------------------------------------------------------------------------------------------------------------
Description: Gets the current user's profile information (based on the provided token).
Authorization required: User & Admin.
Headers: 'Authorization: Bearer [ACCESS_TOKEN_OF_USER]'
Response (Success - 200 OK): 
{ 
    "message": "Get user information successfully", 
    "id": "[ID_NGUOI_DUNG]", 
    "email": "user@example.com", 
    "role": "user", 
    "profile": { 
        "name": "User Name", 
        "phone": "0123456789" 
    }, 
    "createdAt": "YYYY-MM-DDTHH:MM:SS.sssZ", 
    "updatedAt": "YYYY-MM-DDTHH:MM:SS.sssZ" 
}

Response (Failed - 401 Unauthorized / 403 Forbidden / 404 Not Found) 
{ "message": "You are not authenticated" }
{ "message": "Token is invalid or expired" }
{ "message": "User not found!" }

'PUT /v1/users/me'
-----------------------------------------------------------------------------------------------------------------------
Description: Update the profile information of the current user.
Authorization required: User & Admin.
Headers: 'Authorization: Bearer [USER_ACCESS_TOKEN]'
Body (JSON):
{
    "name": "New Name",
    "phone": "+1999888777",
    "password": "new_password"
}
Response (Success - 200 OK):
{
    "message": "Update profile successfully",
    "user": {
        "id": "[USER_ID]",
        "email": "user@example.com",
        "role": "user",
        "profile": {
            "name": "New Name",
            "phone": "+1999888777"
        },
        "createdAt": "YYYY-MM-DDTHH:MM:SS.sssZ",
        "updatedAt": "YYYY-MM-DDTHH:MM:SS.sssZ"
    }
}

Response (Failed - 401/404/500): (Similar to 'GET /users/me', and server side errors)

'GET /v1/users'
-----------------------------------------------------------------------------------------------------------------------
Description: Get a list of all users in the system. Admin only.
Authorization required: Admin.
Headers: 'Authorization: Bearer [ADMIN_ACCESS_TOKEN]'
Response (Success - 200 OK):
{
    "message": "Get all user successful",
    "users": [
        { Admin Info },
        { User 1 Info },
        { User 2 Info }
    ]
}

Response (Failure - 403 Forbidden):
{ "message": "You don't have this access" }

'PUT /v1/users/:id'
-----------------------------------------------------------------------------------------------------------------------
Description: Update any user's profile information by ID. Admin only.
Authorization required: Admin.
Headers: 'Authorization: Bearer [ADMIN_ACCESS_TOKEN]'
Body (JSON):
{
    "name": "Update User Name",
    "phone": "+1222333444",
    "password": "new_password_admin_set",
    "role": "admin"
}

Response (Success - 200 OK):
{
    "message": "Update email [EMAIL_USER] successfully",
    "user": { User information updated }
}
Response (Failure - 403/404/500): (Similar to 'GET /users', and server side errors)

'DELETE /v1/users/:id'
-----------------------------------------------------------------------------------------------------------------------
Description: Deletes a user from the system by their ID. Admin only.
Authorization Request: Admin.
Headers: 'Authorization: Bearer [ADMIN_ACCESS_TOKEN]'
Response (Success - 200 OK):

{ "message": "Delete [EMAIL_USERNAME] successfully" }
Response (Failure - 403/404/500): (Similar to 'GET /users', and server side errors)

🔄 Mock Data Strategy
-----------------------------------------------------------------------------------------------------------------------------
To focus on business logic without installing or running a real database, the project uses an 'in-memory data' strategy.
- Actual database operations (CRUD) are replaced with functions that manipulate JavaScript arrays and objects stored in 'src/data/mockData.js'.
- The data layer ('userRepo', 'auditLogsRepo', 'notificationLogRepo') is abstracted so that it can be easily migrated to a real database later (e.g. MongoDB, PostgreSQL) without changing the logic at the controller layer.
Note: 'mockData.js' is shared between the Main Backend (User manage project) and Notification Service via Docker Volumes to simplify mock data management in a multi-service environment.

📧 Microservice Mock Integration (Notification Service)
-----------------------------------------------------------------------------------------------------------------------------
- Separate service: 'notification-service' is deployed as a standalone Node.js application, running on a separate port (8082).
- RESTful communication: The main backend communicates with the Notification Service via HTTP POST requests to the '/send' endpoint. The Notification Service URL is configured via the environment variable ('NOTIFICATION_SERVICE_URL').
- Communication in Docker Compose: Services communicate with each other using the service name ('notification-service') in the Docker Compose internal network, ensuring stability and scalability.
- Retry Mechanism: The 'notificationSender' function (in `src/utils/`) has an integrated mechanism to automatically retry several times if the notification request fails, increasing the stability of the integration. Failures are logged in Audit Logs.
Purpose: Simulate integration with third-party services such as email/SMS providers without actually implementing them.

📝 Audit Logging
----------------------------------------------------------------------------------------------------------------
- Every important action in the system (registration, login, profile update, user deletion) is recorded in the audit log.
- The logs contain details such as 'user_id', 'action', 'timestamp', 'status' (success/failure), and 'request_meta' (additional information about the request).
- Audit logs are stored in memory ('auditLogs' in 'src/data/mockData.js').

🧠 Bonus Task Completed (Optional)
-------------------------------------------------------------------------------------------------------------
Postman Collection: A Postman Collection containing all the implemented APIs will be provided for easy testing.
Notification Service Error Simulation: Notification service capable of simulating errors (configured via environment variable 'SIMULATE_FAILURE_RATE' in 'notification-service/.env.example') to test the backend's retry mechanism.

🛠️ Technology used
----------------------------------------------------------------------------------------------------------------
Language: Node.js
Framework: Express.js
Authentication: JWT (JSON Web Tokens)
Password hashing: bcrypt
Generate UUID: 'uuid'
HTTP Client: 'axios' (to call the microservice)
Environment variable: 'dotenv'
Containerization: Docker & Docker Compose