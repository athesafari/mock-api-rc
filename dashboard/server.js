import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = process.env.PORT || 8081;
const wiremockHost = process.env.WIREMOCK_HOST;
const wiremockPort = process.env.WIREMOCK_PORT;
const derivedWiremockUrl = wiremockHost
  ? `http://${wiremockHost}${wiremockPort ? `:${wiremockPort}` : ""}`
  : null;
const WIREMOCK_URL = process.env.WIREMOCK_URL || derivedWiremockUrl || "http://localhost:8080";

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Simple heartbeat for Render health checks
app.get("/healthz", (_req, res) => res.json({ ok: true }));

// List mocks
app.get("/api/mocks", async (_req, res) => {
  try {
    const { data } = await axios.get(`${WIREMOCK_URL}/__admin/mappings`);
    res.json(data.mappings || []);
  } catch (e) {
    console.error("Failed to list mocks from WireMock:", {
      baseUrl: WIREMOCK_URL,
      status: e?.response?.status,
      statusText: e?.response?.statusText,
      data: e?.response?.data,
      message: e.message
    });
    res.status(500).json({ error: e.message, source: "wiremock" });
  }
});

// Create mock
app.post("/api/mocks", async (req, res) => {
  try {
    const { url, method, status, body } = req.body;
    const payload = {
      request: { method, url },
      response: {
        status: Number(status),
        body,
        headers: { "Content-Type": "application/json" }
      }
    };
    const { data } = await axios.post(`${WIREMOCK_URL}/__admin/mappings`, payload);
    res.json(data);
  } catch (e) {
    console.error("Failed to create mock:", {
      baseUrl: WIREMOCK_URL,
      status: e?.response?.status,
      statusText: e?.response?.statusText,
      error: e?.response?.data || e.message,
      payload: req.body
    });
    res.status(500).json({ error: e.message, source: "wiremock" });
  }
});

// Delete mock
app.delete("/api/mocks/:id", async (req, res) => {
  try {
    await axios.delete(`${WIREMOCK_URL}/__admin/mappings/${req.params.id}`);
    res.json({ success: true });
  } catch (e) {
    console.error("Failed to delete mock:", {
      baseUrl: WIREMOCK_URL,
      status: e?.response?.status,
      statusText: e?.response?.statusText,
      error: e?.response?.data || e.message,
      id: req.params.id
    });
    res.status(500).json({ error: e.message, source: "wiremock" });
  }
});

// Update mock
app.put("/api/mocks/:id", async (req, res) => {
  try {
    const { url, method, status, body } = req.body;
    const payload = {
      request: { method, url },
      response: {
        status: Number(status),
        body,
        headers: { "Content-Type": "application/json" }
      }
    };
    const { data } = await axios.put(`${WIREMOCK_URL}/__admin/mappings/${req.params.id}`, payload);
    res.json(data);
  } catch (e) {
    console.error("Failed to update mock:", {
      baseUrl: WIREMOCK_URL,
      status: e?.response?.status,
      statusText: e?.response?.statusText,
      error: e?.response?.data || e.message,
      id: req.params.id,
      payload: req.body
    });
    res.status(500).json({ error: e.message, source: "wiremock" });
  }
});

app.listen(port, () => {
  console.log(`✅ Dashboard running on port ${port}`);
  console.log(`🔗 Using WireMock base URL: ${WIREMOCK_URL}`);
});
