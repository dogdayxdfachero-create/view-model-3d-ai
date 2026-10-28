import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

type GenerateBody = { prompt?: string; texturePrompt?: string; mode?: "model" | "texture" };
type ProviderResult = { mode: "demo" | "provider"; message: string; model?: unknown };

async function generateWithProvider(body: GenerateBody): Promise<ProviderResult> {
  const provider = process.env.AI_PROVIDER || "demo";
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL;

  // Adapter seam: plug in a real 3D-generation/texturing provider here.
  // Provider APIs differ in authentication, request format, async job polling and output formats.
  // This deliberately refuses to pretend that a demo is a real generated mesh.
  if (provider === "demo" || !apiKey || !apiUrl) {
    return {
      mode: "demo",
      message: "Demo mode only. Configure a compatible 3D AI provider to generate actual meshes or textures."
    };
  }

  // Generic adapter placeholder: no universal API contract exists across 3D AI vendors.
  // Implement the provider-specific request and result parsing before enabling production generation.
  return {
    mode: "demo",
    message: `Provider "${provider}" is configured but its API adapter is not implemented yet.`
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, app: "View Model 3D AI", generation: "demo-until-provider-adapter-is-configured" });
});

app.post("/api/generate", async (req, res) => {
  const body = req.body as GenerateBody;
  if (!body.prompt || typeof body.prompt !== "string" || body.prompt.trim().length < 3) {
    return res.status(400).json({ error: "Escribe una descripción de al menos 3 caracteres." });
  }
  if (body.prompt.length > 2000) {
    return res.status(400).json({ error: "La descripción no puede superar 2000 caracteres." });
  }
  try {
    const result = await generateWithProvider(body);
    return res.json(result);
  } catch (error) {
    console.error("Generation request failed:", error);
    return res.status(502).json({ error: "El proveedor de generación no respondió correctamente." });
  }
});

// In production, serve the built React app from the same Render web service.
const distPath = path.resolve(process.cwd(), "dist");
app.use(express.static(distPath));
app.get("*", (_req, res, next) => {
  res.sendFile(path.join(distPath, "index.html"), (error) => {
    if (error) next(error);
  });
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => console.log(`View Model 3D AI API listening on http://localhost:${port}`));
