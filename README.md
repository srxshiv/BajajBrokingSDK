# Bajaj Broking Trading SDK

A backend wrapper SDK and REST API designed to simulate core trading functionalities. This project allows users to view instruments, place market/limit orders, execute trades, and manage portfolio holdings using a sqllite database.

Tech Stack--

Runtime: Node.js
Language: TypeScript
Framework: Express.js
Database: SQLite 
Testing: Jest
Api Documentation: Swagger 
Containerization: Docker



Setup & Run Instructions


1. Run Locally --

Clone the repository and install dependencies:

```bash
git clone https://github.com/srxshiv/BajajBrokingSDK.git
cd BajajBrokingSDK
npm install
```

Start the development server:

```bash
npm run dev
```
The server will start at http://localhost:3000. The database file bajajTrades.db will be created automatically on the first run.

2. Run with Docker-

You can containerize the entire application using Docker.

Build the image:

```Bash
docker build -t bajaj-trading-app .
```
Run the container:

```Bash
docker run -p 3000:3000 bajaj-trading-app
```

3. Run Tests

Unit tests are implemented using Jest to verify critical trade logic (e.g., sufficient funds, order execution).

```bash
npm test
```

// API Details
Base URL: http://localhost:3000/api/v1

Method	Endpoint	Description
GET	    /instruments  Fetch list of tradable assets (e.g., TCS, BAJAJ)
POST	/orders	      Place a BUY or SELL order (MARKET/LIMIT)
GET	    /orders/:id	  Check the status of a specific order
GET	    /portfolio	  View current holdings, cash balance, and total value
GET	    /trades	      View history of executed trades

4. Swagger Documentation --

For interactive API testing and  schema definitions, visit the Swagger UI after starting the server:

URL: http://localhost:3000/docs

// Assumptions made during development- 

->only one hard coded single user (shiv_rajput) exists so no login or user refrencing required
->live price of stocks data is also hard coded 
-> market orders are executed immediately, limit orders stay in placed state 


// SDK USAGE- 

The project includes a TypeScript SDK wrapper (BajajBrokingSDK) to interact with the API programmatically.
Example in src/demo.ts file

// curl commands for testing -

cURL Examples
You can test the API directly using your terminal.

1. Get Instruments

curl -X GET http://localhost:3000/api/v1/instruments

2. Place a BUY Order (Market)

curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "TCS",
    "type": "BUY",
    "style": "MARKET",
    "quantity": 10
  }'

3. Get Portfolio

curl -X GET http://localhost:3000/api/v1/portfolio

4. Check Order Status

// Replace <order_id> with an actual ID from step 2
curl -X GET http://localhost:3000/api/v1/orders/<order_id>