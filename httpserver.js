import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const vehicles = [
  {
    id: 1,
    vehicleName: "Hyundai Creta",
    vehicleNumber: "HR26AB1234",
    type: "SUV",
    price: 1500000
  },
  {
    id: 2,
    vehicleName: "Honda City",
    vehicleNumber: "DL3CAB5678",
    type: "Sedan",
    price: 1200000
  },
  {
    id: 3,
    vehicleName: "Tata Nexon",
    vehicleNumber: "UP14CD9012",
    type: "SUV",
    price: 1100000
  }
];

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // Route: GET / (Welcome page in HTML format)
  if (method === 'GET' && url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Welcome to the Vehicle Management Web Application</h1>');
  }

  // Route: GET /about (Application information)
  else if (method === 'GET' && url === '/about') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      application: "Vehicle Management Web Application",
      description: "Maintains vehicle records using Node.js HTTP and FS modules",
      version: "1.0.0"
    }));
  }

  // Route: GET /info (Serve static file public/info.html using FS module)
  else if (method === 'GET' && url === '/info') {
    const filePath = path.join(__dirname, 'public', 'info.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Internal Server Error: Could not read info.html" }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }

  // Route: GET /vehicles (List all vehicle records in JSON format)
  else if (method === 'GET' && url === '/vehicles') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(vehicles));
  }

  // Route: POST /add-vehicle (Accept JSON and add a new vehicle record)
  else if (method === 'POST' && url === '/add-vehicle') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const parsedBody = JSON.parse(body);
        const { id, vehicleName, vehicleNumber, type, price } = parsedBody;

        if (
          id === undefined ||
          !vehicleName ||
          !vehicleNumber ||
          !type ||
          typeof price !== 'number' ||
          price <= 0
        ) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: "Bad Request: Required fields (id, vehicleName, vehicleNumber, type, positive price) are missing or invalid"
          }));
          return;
        }

        const newVehicle = { id, vehicleName, vehicleNumber, type, price };
        vehicles.push(newVehicle);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: "Vehicle added successfully",
          vehicle: newVehicle
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Bad Request: Invalid JSON format" }));
      }
    });
  }

  // Handle 404 for invalid routes
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: "404 Not Found: The requested route does not exist" }));
  }
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});