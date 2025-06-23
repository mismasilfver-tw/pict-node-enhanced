const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const routes = require("./routes");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use("/api", routes);

// Serve the simplified web interface
app.get("/", (req, res) => {
  const simplifiedAppPath = path.join(
    __dirname,
    "../web-interface/src/simplified-app/index.html",
  );
  if (fs.existsSync(simplifiedAppPath)) {
    res.sendFile(simplifiedAppPath);
  } else {
    res.send(
      "Simplified web interface not found. Please check the server configuration.",
    );
  }
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../web-interface/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../web-interface/build", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`PICT-Node server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  if (process.env.NODE_ENV === "production") {
    console.log(`Web interface available at http://localhost:${PORT}`);
  } else {
    console.log(
      `Web interface development server should be running separately`,
    );
  }
});
