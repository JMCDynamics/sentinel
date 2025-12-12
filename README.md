# Sentinel

Simple and lightweight monitoring tool designed to keep an eye on your system's health and performance. It provides real-time alerts to help you stay informed about critical issues before they impact your operations.

## Features

- Health monitoring of applications by checking their availability and responsiveness.
- Integration with popular notification services Slack and Discord for real-time alerts.
- Customizable alert thresholds to suit your specific needs.
- Easy setup and configuration with a user-friendly interface.
- Self-hosted and open-source, giving you full control over your monitoring solution.

## Installation

Sentinel can be easily deployed using Docker. Follow the steps below to get started:

1. Ensure you have Docker installed on your system. If not, you can download it from [here](https://www.docker.com/get-started).

2. Clone the repository:

   ```bash
   git clone https://github.com/jmcdynamics/sentinel.git
   ```

3. Navigate to the project directory:

   ```bash
   cd sentinel
   ```

4. Start the Sentinel service using Docker Compose:

   ```bash
   docker-compose up -d
   ```

Or use the official Docker image:

```bash
docker run -d -e "ROOT_USERNAME=admin" -e "ROOT_PASSWORD=admin" -p 80:80 mateusgcoelho/sentinel:latest
```

## Connectors

### @heimdall-sdk/express

We also provide an Express middleware package to easily integrate Sentinel monitoring into your Node.js applications.

Install the package via npm:

```bash
npm install @heimdall-sdk/express
```

Then, use it in your Express application:

```typescript
import { heimdall } from "@heimdall-sdk/express";
import express from "express";

const app = express();

app.use(express.json());
app.use(
  heimdall({
    baseUrl: "http://localhost:8080",
    serviceName: "my-company-api",
    apiKey: "heim_4o8WW5SWg6jWuu0FTnlSnwCqS6a_HfcsZ65Y2iiS2GM", // Replace with your actual API key generated from Sentinel
    flushIntervalMs: 10_000, // Optional: default is 10,000 ms
    flushSize: 50, // Optional: default is 50
  })
);

app.get("/", async (req, res) => {
  res.status(200).json({ message: "hello world" });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```
