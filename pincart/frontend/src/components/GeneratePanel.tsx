"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";

interface Product {
  title: string;
  image: string;
  pin_url: string;
  demand_score: number;
}

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
  product: Product | null;
  userId?: string;
  onGenerated: (page: GeneratedPage) => void;
}

type Step = "supplier" | "configure" | "generating" | "done";

export default function GeneratePanel({ product, userId, onGenerated }: Props) {
  const [step, setStep] = useState<Step>("supplier");
  const [supplierData, setSupplierData] = useState<any>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [tone, setTone] = useState("standard");
  const [audience, setAudience] = useState("");
  const [generated, setGenerated] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!product) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg mb-2">📝</p>
        <p className="font-medium">Select a product from Discover first</p>
        <p className="text-sm mt-1">
          Click &quot;Generate Page&quot; on any product card to start.
        </p>
      </div>
    );
  }

  async function findSuppliers() {
    setLoading(true);
    setError("");
    try {
      const data = await apiPost("/match-product", {
        product_title: product!.title,
        image_url: product!.image,
      });
      setSupplierData(data);
      if (data.suppliers?.length) {
        setSelectedSupplier(data.suppliers[0]);
      }
      setStep("configure");
    } catch (err: any) {
      setError(err.message || "Supplier matching failed");
    } finally {
      setLoading(false);
    }
  }

  async function generatePage() {
    setStep("generating");
    setError("");
    try {
      const data = await apiPost("/generate", {
        product_name: product!.title,
        target_audience: audience,
        tone,
        supplier_price: selectedSupplier?.unit_cost,
        user_id: userId,
      });
      setGenerated(data.generated);
      setStep("done");

      onGenerated({
        product_name: data.product_name,
        generated: data.generated,
        supplier: selectedSupplier
          ? {
              unit_cost: selectedSupplier.unit_cost,
              suggested_retail: selectedSupplier.suggested_retail,
              image: product!.image,
            }
          : undefined,
      });
    } catch (err: any) {
      setError(err.message || "Generation failed. Please retry.");
      setStep("configure");
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Generate Product Page</h2>
      <p className="text-gray-500 text-sm mb-6">
        AI will write your complete Shopify listing.
      </p>

      {/* Selected product preview */}
      <div className="card flex gap-4 mb-6">
        {product.image && (
          <img
            src={product.image}
            alt={product.title}
            className="w-20 h-20 rounded-lg object-cover"
          />
        )}
        <div>
          <h3 className="font-semibold">{product.title}</h3>
          <span className="text-xs text-gray-500">
            Demand Score: {product.demand_score}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Step: Find suppliers */}
      {step === "supplier" && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            First, let&apos;s find supplier pricing for this product.
          </p>
          <button
            onClick={findSuppliers}
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Matching suppliers...
              </span>
            ) : (
              "Find Suppliers"
            )}
          </button>
        </div>
      )}

      {/* Step: Configure generation */}
      {step === "configure" && (
        <div className="space-y-6">
          {/* Supplier results */}
          {supplierData?.suppliers?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Supplier Matches</h3>
              <div className="grid gap-3">
                {supplierData.suppliers.map((s: any, i: number) => (
                  <div
                    key={i}
                    onClick={() => setSelectedSupplier(s)}
                    className={`card cursor-pointer flex items-center justify-between ${
                      selectedSupplier === s
                        ? "border-brand-500 ring-2 ring-brand-100"
                        : ""
                    }`}
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {s.product_title || s.supplier_name}
                      </p>
                      <p className="text-xs text-gray-500">{s.source}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">
                        ${s.unit_cost?.toFixed(2)}
                      </p>
                      <p className="text-xs text-green-600">
                        Sell ${s.suggested_retail?.toFixed(2)} (
                        {s.estimated_margin_pct}% margin)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {supplierData.disclaimer}
              </p>
            </div>
          )}

          {/* Generation config */}
          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Tone Preset
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="standard">Standard</option>
                <option value="playful">Playful</option>
                <option value="luxury">Luxury</option>
                <option value="urgency">Urgency-Driven</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Target Audience (optional)
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder='e.g. "busy moms", "college students", "gym beginners"'
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <button onClick={generatePage} className="btn-primary w-full">
              ✨ Generate Product Page with AI
            </button>
          </div>
        </div>
      )}

      {/* Step: Generating */}
      {step === "generating" && (
        <div className="text-center py-16">
          <div className="animate-spin w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-medium text-gray-700">Writing your product page...</p>
          <p className="text-sm text-gray-400 mt-1">
            Analyzing product · Writing description · Building FAQ...
          </p>
        </div>
      )}

      {/* Step: Done — preview */}
      {step === "done" && generated && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 text-sm">
            ✅ Product page generated! Review below, then export to Shopify CSV.
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-3">{generated.seo_title}</h3>
            <div
              className="prose prose-sm max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: generated.description }}
            />
          </div>

          {generated.bullets?.length > 0 && (
            <div className="card">
              <h4 className="font-semibold mb-2">Key Features</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {generated.bullets.map((b: string, i: number) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          {generated.faq?.length > 0 && (
            <div className="card">
              <h4 className="font-semibold mb-2">FAQ</h4>
              {generated.faq.map((item: any, i: number) => (
                <div key={i} className="mb-3">
                  <p className="font-medium text-sm">{item.q}</p>
                  <p className="text-sm text-gray-600">{item.a}</p>
                </div>
              ))}
            </div>
          )}

          {generated.tiktok_hook && (
            <div className="card">
              <h4 className="font-semibold mb-1">TikTok Ad Hook</h4>
              <p className="text-sm text-gray-600">{generated.tiktok_hook}</p>
            </div>
          )}

          <button
            onClick={() => onGenerated({
              product_name: product!.title,
              generated,
              supplier: selectedSupplier
                ? { unit_cost: selectedSupplier.unit_cost, suggested_retail: selectedSupplier.suggested_retail, image: product!.image }
                : undefined,
            })}
            className="btn-primary w-full text-center"
          >
            Continue to Export →
          </button>
        </div>
      )}
    </div>
  );
}
