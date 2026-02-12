"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DiscoverPanel from "@/components/DiscoverPanel";
import GeneratePanel from "@/components/GeneratePanel";
import ExportPanel from "@/components/ExportPanel";

type Tab = "discover" | "generate" | "export";

interface SelectedProduct {
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

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("discover");
  const [selectedProduct, setSelectedProduct] =
    useState<SelectedProduct | null>(null);
  const [generatedPage, setGeneratedPage] = useState<GeneratedPage | null>(
    null
  );
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  function onProductSelected(product: SelectedProduct) {
    setSelectedProduct(product);
    setTab("generate");
  }

  function onPageGenerated(page: GeneratedPage) {
    setGeneratedPage(page);
    setTab("export");
  }

  const tabs: { key: Tab; label: string; step: string }[] = [
    { key: "discover", label: "Discover", step: "1" },
    { key: "generate", label: "Generate", step: "2" },
    { key: "export", label: "Export", step: "3" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <span className="text-lg font-bold text-brand-600">PinCart AI</span>
        <div className="flex items-center gap-4">
          <Link
            href="/billing"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Billing
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto flex">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                  tab === t.key
                    ? "bg-brand-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {t.step}
              </span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {tab === "discover" && (
          <DiscoverPanel onSelect={onProductSelected} />
        )}
        {tab === "generate" && (
          <GeneratePanel
            product={selectedProduct}
            userId={user?.id}
            onGenerated={onPageGenerated}
          />
        )}
        {tab === "export" && <ExportPanel page={generatedPage} />}
      </main>
    </div>
  );
}
