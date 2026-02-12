"use client";

import { useState } from "react";
import { apiGet } from "@/lib/api";

interface Product {
  title: string;
  image: string;
  pin_url: string;
  demand_score: number;
  saves_text: string;
}

interface Props {
  onSelect: (product: Product) => void;
}

export default function DiscoverPanel({ onSelect }: Props) {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const data = await apiGet<{ products: Product[] }>(
        `/discover?keyword=${encodeURIComponent(keyword.trim())}`
      );
      setResults(data.products || []);
      if (!data.products?.length) {
        setError(
          "No trending products found. Try a broader keyword like 'home decor' or 'fitness gadgets'."
        );
      }
    } catch (err: any) {
      setError(err.message || "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function scoreBadge(score: number) {
    if (score >= 70) return "bg-green-100 text-green-700";
    if (score >= 40) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Discover Trending Products</h2>
      <p className="text-gray-500 text-sm mb-6">
        Enter a niche keyword to find products with real demand on Pinterest.
      </p>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder='Try "home decor", "pet accessories", "fitness gadgets"...'
          maxLength={80}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Searching...
            </span>
          ) : (
            "Search Pinterest"
          )}
        </button>
      </form>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            Scanning Pinterest for trending products...
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {results.map((product, i) => (
            <div
              key={i}
              className="card hover:shadow-md transition-shadow cursor-pointer group"
            >
              {product.image && (
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <h3 className="text-sm font-medium line-clamp-2 mb-2">
                {product.title}
              </h3>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scoreBadge(
                    product.demand_score
                  )}`}
                >
                  {product.demand_score}
                </span>
                {product.pin_url && (
                  <a
                    href={product.pin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-brand-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Pin ↗
                  </a>
                )}
              </div>
              <button
                onClick={() => onSelect(product)}
                className="w-full text-center text-sm font-semibold text-brand-600 border border-brand-200 rounded-lg py-1.5 hover:bg-brand-50 transition-colors"
              >
                Generate Page →
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && !results.length && !error && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">🔍</p>
          <p className="font-medium">
            Enter a niche to find your first trending product
          </p>
          <p className="text-sm mt-1">
            Try &quot;home decor&quot; or &quot;pet accessories&quot;
          </p>
        </div>
      )}
    </div>
  );
}
