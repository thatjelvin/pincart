"use client";

import { useState } from "react";
import { apiPostBlob } from "@/lib/api";

interface GeneratedPage {
  product_name: string;
  generated: {
    seo_title: string;
    description: string;
    bullets: string[];
    faq: { q: string; a: string }[];
    meta_description: string;
    tiktok_hook?: string;
    pinterest_caption?: string;
  };
  supplier?: {
    unit_cost: number;
    suggested_retail: number;
    image?: string;
  };
}

interface Props {
  page: GeneratedPage | null;
}

export default function ExportPanel({ page }: Props) {
  const [loading, setLoading] = useState(false);
  const [exported, setExported] = useState(false);
  const [error, setError] = useState("");

  if (!page) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg mb-2">📦</p>
        <p className="font-medium">
          Your exported files will appear here
        </p>
        <p className="text-sm mt-1">
          Complete a product generation first to export.
        </p>
      </div>
    );
  }

  async function handleExport() {
    setLoading(true);
    setError("");
    try {
      const blob = await apiPostBlob("/export", {
        product_name: page!.generated.seo_title || page!.product_name,
        description_html: page!.generated.description,
        bullets: page!.generated.bullets,
        faq: page!.generated.faq,
        price: page!.supplier?.suggested_retail || 29.99,
        image_url: page!.supplier?.image || "",
        seo_title: page!.generated.seo_title,
        seo_description: page!.generated.meta_description,
      });

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pincart-${page!.product_name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .slice(0, 40)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExported(true);
    } catch (err: any) {
      setError(err.message || "Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Export to Shopify</h2>
      <p className="text-gray-500 text-sm mb-6">
        Download a Shopify-ready CSV to import directly into your store.
      </p>

      {/* Summary */}
      <div className="card mb-6">
        <h3 className="font-semibold mb-3">Export Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Product</span>
            <span className="font-medium">{page.generated.seo_title}</span>
          </div>
          {page.supplier && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-500">Cost Price</span>
                <span>${page.supplier.unit_cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Retail Price</span>
                <span className="font-bold text-green-600">
                  ${page.supplier.suggested_retail.toFixed(2)}
                </span>
              </div>
            </>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Sections</span>
            <span>
              Title, Description, {page.generated.bullets.length} bullets,{" "}
              {page.generated.faq.length} FAQs
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 text-sm">
          {error}
        </div>
      )}

      {exported ? (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-6 text-center">
          <p className="text-lg font-semibold mb-2">
            🎉 CSV Downloaded Successfully!
          </p>
          <p className="text-sm mb-4">
            Now import this file into your Shopify store:
          </p>
          <ol className="text-sm text-left max-w-md mx-auto space-y-2">
            <li>
              1. Go to <strong>Shopify Admin → Products</strong>
            </li>
            <li>
              2. Click <strong>Import</strong>
            </li>
            <li>
              3. Upload the CSV file you just downloaded
            </li>
            <li>
              4. Click <strong>Import products</strong>
            </li>
            <li>5. Your product is live! 🚀</li>
          </ol>
          <button
            onClick={handleExport}
            className="btn-secondary mt-4 text-sm"
          >
            Download Again
          </button>
        </div>
      ) : (
        <button
          onClick={handleExport}
          disabled={loading}
          className="btn-primary w-full text-center disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Building CSV...
            </span>
          ) : (
            "⬇️ Download Shopify CSV"
          )}
        </button>
      )}

      {/* Shopify import instructions */}
      <div className="mt-8 card bg-gray-50">
        <h4 className="font-semibold text-sm mb-2">
          How to import into Shopify
        </h4>
        <p className="text-xs text-gray-500">
          Go to your Shopify Admin → Products → Import → Upload the CSV file →
          your product will appear in your store ready to sell. The CSV includes
          title, description, price, images, SEO data, and all required fields.
        </p>
      </div>
    </div>
  );
}
