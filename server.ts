import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API routes
  app.post("/api/ocr", async (req, res) => {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }
    // Mock OCR service
    console.log("Processing image...");
    res.json({
      merchant: { name: "Mock Merchant", address: "123 Main St", category: "Restauración" },
      transaction: { date: new Date().toISOString(), currency: "EUR", total_amount: 50.00, tax_amount: 5.00 },
      items: [{ description: "Mock Item", quantity: 1, price_per_unit: 50.00, total_item_price: 50.00 }],
      confidence_score: 0.95
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
