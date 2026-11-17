import express from 'express';

const app = express();
const PORT = 4000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// Catch invalid JSON syntax errors from express.json()
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: "Invalid JSON payload provided" });
  }
  next();
});

// Initialize array with 3 sample vehicle records
let vehicles = [
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

// Helper function to validate vehicle fields
const validateVehicleInput = ({ id, vehicleName, vehicleNumber, type, price }, requireId = true) => {
  if (requireId && (id === undefined || id === null)) {
    return "Vehicle ID is required";
  }
  if (!vehicleName || !vehicleNumber || !type || price === undefined) {
    return "All required fields (id, vehicleName, vehicleNumber, type, price) must be provided";
  }
  if (typeof price !== 'number' || price <= 0) {
    return "Price must be a positive number";
  }
  return null;
};

// 1. GET /vehicles - Retrieve all vehicles
app.get('/vehicles', (req, res) => {
  res.status(200).json(vehicles);
});

// 2. GET /vehicles/:id - Retrieve vehicle by ID
app.get('/vehicles/:id', (req, res) => {
  const vehicleId = parseInt(req.params.id, 10);
  const vehicle = vehicles.find((v) => v.id === vehicleId);

  if (!vehicle) {
    return res.status(404).json({ error: "Vehicle not found" });
  }

  res.status(200).json(vehicle);
});

// 3. POST /vehicles - Add a new vehicle
app.post('/vehicles', (req, res) => {
  const validationError = validateVehicleInput(req.body, true);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { id, vehicleName, vehicleNumber, type, price } = req.body;

  const newVehicle = {
    id: Number(id),
    vehicleName,
    vehicleNumber,
    type,
    price
  };

  vehicles.push(newVehicle);

  res.status(201).json({
    message: "Vehicle added successfully",
    vehicle: newVehicle
  });
});

// 4. PUT /vehicles/:id - Update vehicle details
app.put('/vehicles/:id', (req, res) => {
  const vehicleId = parseInt(req.params.id, 10);
  const index = vehicles.findIndex((v) => v.id === vehicleId);

  if (index === -1) {
    return res.status(404).json({ error: "Vehicle not found" });
  }

  const validationError = validateVehicleInput(req.body, false);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { vehicleName, vehicleNumber, type, price } = req.body;

  vehicles[index] = {
    id: vehicleId,
    vehicleName,
    vehicleNumber,
    type,
    price
  };

  res.status(200).json({
    message: "Vehicle updated successfully",
    vehicle: vehicles[index]
  });
});

// 5. DELETE /vehicles/:id - Delete a vehicle
app.delete('/vehicles/:id', (req, res) => {
  const vehicleId = parseInt(req.params.id, 10);
  const index = vehicles.findIndex((v) => v.id === vehicleId);

  if (index === -1) {
    return res.status(404).json({ error: "Vehicle not found" });
  }

  const deletedVehicle = vehicles.splice(index, 1)[0];

  res.status(200).json({
    message: "Vehicle deleted successfully",
    vehicle: deletedVehicle
  });
});

// Handle 404 for unknown endpoints
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});