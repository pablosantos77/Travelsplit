
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: "No image provided" });
  }

  // Mock OCR service
  console.log("Processing image...");
  return res.status(200).json({
    merchant: { name: "Mock Merchant", address: "123 Main St", category: "Restauración" },
    transaction: { date: new Date().toISOString(), currency: "EUR", total_amount: 50.00, tax_amount: 5.00 },
    items: [{ description: "Mock Item", quantity: 1, price_per_unit: 50.00, total_item_price: 50.00 }],
    confidence_score: 0.95
  });
}
