"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { apiPost } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$19",
    period: "/mo",
    features: [
      "20 product discoveries / month",
      "10 AI generations / month",
      "Shopify CSV export",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$39",
    period: "/mo",
    features: [
      "100 product discoveries / month",
      "Unlimited AI generations",
      "CSV export",
      "TikTok & Pinterest ad copy",
      "Priority support",
    ],
    popular: true,
  },
];

export default function BillingPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);

      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();
      setProfile(profileData);
    });
  }, []);

  async function handleUpgrade(plan: string) {
    if (!user) return;
    setLoading(plan);
    try {
      const data = await apiPost("/create-checkout", {
        user_id: user.id,
        email: user.email,
        plan,
      });
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (err: any) {
      alert(err.message || "Failed to start checkout");
    } finally {
      setLoading(null);
    }
  }

  async function handleManage() {
    if (!user) return;
    setLoading("portal");
    try {
      const data = await apiPost("/create-portal", {
        user_id: user.id,
        email: user.email,
        plan: "",
      });
      if (data.portal_url) {
        window.location.href = data.portal_url;
      }
    } catch (err: any) {
      alert(err.message || "Failed to open billing portal");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-lg font-bold text-brand-600">
          PinCart AI
        </Link>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Dashboard
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-center mb-2">
          Billing & Plans
        </h1>

        {profile && (
          <p className="text-center text-gray-500 mb-8">
            Current plan:{" "}
            <span className="font-semibold text-gray-800 capitalize">
              {profile.plan_tier || "Free"}
            </span>
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {PLANS.map((plan) => {
            const isCurrent =
              profile?.plan_tier === plan.id;
            return (
              <div
                key={plan.id}
                className={`card ${
                  plan.popular
                    ? "border-brand-500 border-2 ring-4 ring-brand-50"
                    : ""
                }`}
              >
                {plan.popular && (
                  <span className="inline-block bg-brand-600 text-white text-xs font-bold px-2 py-0.5 rounded mb-3">
                    MOST POPULAR
                  </span>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <button
                    onClick={handleManage}
                    disabled={loading === "portal"}
                    className="w-full btn-secondary text-sm disabled:opacity-50"
                  >
                    Manage Subscription
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading === plan.id}
                    className="w-full btn-primary text-sm disabled:opacity-50"
                  >
                    {loading === plan.id
                      ? "Redirecting..."
                      : `Upgrade to ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {profile?.stripe_customer_id && (
          <div className="text-center mt-8">
            <button
              onClick={handleManage}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              View invoices & manage billing →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
