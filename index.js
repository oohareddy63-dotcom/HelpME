const express = require("express");
const connectDB = require("./services/db");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
require("dotenv").config();

const userRoute = require("./routes/user");
const locationRoute = require("./routes/location");

// db connection
connectDB();

// middlewares
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3002",
  "http://127.0.0.1:3003",
];
if (process.env.WEB_CLIENT_URL && !allowedOrigins.includes(process.env.WEB_CLIENT_URL)) {
  allowedOrigins.push(process.env.WEB_CLIENT_URL);
}
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.get("/", (req, res) => {
  return res.status(200).json({
    message: "app is delpoyed and tested",
  });
});

app.use("/api/v1/users", userRoute);
app.use("/api/v1/location", locationRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server started on http://localhost:${PORT}`)
);
