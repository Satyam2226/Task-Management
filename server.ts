import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Routes
import authRoutes from "./server/routes/authRoutes";
import projectRoutes from "./server/routes/projectRoutes";
import taskRoutes from "./server/routes/taskRoutes";

dotenv.config();

async function startServer() {
  const app = express();

  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Railway Port Fix
  const PORT = process.env.PORT || 3000;

  // MongoDB Connection
  const MONGODB_URI = process.env.MONGODB_URI;

  if (MONGODB_URI) {
    mongoose
      .connect(MONGODB_URI)
      .then(() => {
        console.log("✅ MongoDB Connected");
      })
      .catch((err) => {
        console.error("❌ MongoDB Error:", err.message);
      });
  } else {
    console.warn("⚠️ MONGODB_URI Missing");
  }

  // Middlewares
  app.use(cors());
  app.use(express.json());

  // Socket.io
  app.set("io", io);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-project", (projectId) => {
      socket.join(projectId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/tasks", taskRoutes);

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      db:
        mongoose.connection.readyState === 1
          ? "connected"
          : "disconnected",
    });
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start Server
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();