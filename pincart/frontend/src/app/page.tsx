import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-xl font-bold text-brand-600">PinCart AI</span>
        <div className="flex gap-3">
          <Link href="/login" className="btn-secondary text-sm">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary text-sm">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-6 pt-20 pb-16">
        <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
          Find Trending Products.
          <br />
          <span className="text-brand-600">Launch Your Store Today.</span>
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
          PinCart AI discovers viral Pinterest products, matches them to
          suppliers, writes your product page with AI, and exports a
          Shopify-ready CSV — all in under 10 minutes.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/signup" className="btn-primary text-lg px-8 py-3">
            Start Free — No Card Required
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              step: "1",
              title: "Discover",
              desc: "Enter a niche keyword. We find the top trending products on Pinterest.",
            },
            {
              step: "2",
              title: "Match",
              desc: "We match products to real suppliers with live pricing and margins.",
            },
            {
              step: "3",
              title: "Generate",
              desc: "AI writes your entire product page — title, description, FAQ, and ad copy.",
            },
            {
              step: "4",
              title: "Export",
              desc: "Download a Shopify-ready CSV. Import and start selling the same day.",
            },
          ].map((item) => (
            <div key={item.step} className="card text-center">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 font-bold flex items-center justify-center mx-auto text-lg">
                {item.step}
              </div>
              <h3 className="mt-4 font-semibold text-lg">{item.title}</h3>
              <p className="mt-2 text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 py-16" id="pricing">
        <h2 className="text-3xl font-bold text-center mb-12">
          Simple Pricing
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Free",
              price: "$0",
              features: [
                "3 product discoveries",
                "1 AI generation",
                "No CSV export",
              ],
              cta: "Get Started",
              highlight: false,
            },
            {
              name: "Starter",
              price: "$19",
              period: "/mo",
              features: [
                "20 discoveries / month",
                "10 AI generations / month",
                "Shopify CSV export",
                "Email support",
              ],
              cta: "Start Starter Plan",
              highlight: true,
            },
            {
              name: "Pro",
              price: "$39",
              period: "/mo",
              features: [
                "100 discoveries / month",
                "Unlimited AI generations",
                "CSV export",
                "TikTok & Pinterest ad copy",
                "Priority support",
              ],
              cta: "Start Pro Plan",
              highlight: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`card ${
                plan.highlight
                  ? "border-brand-500 border-2 ring-4 ring-brand-50"
                  : ""
              }`}
            >
              <h3 className="font-semibold text-lg">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                {plan.period && (
                  <span className="text-gray-500">{plan.period}</span>
                )}
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`block mt-6 text-center py-2.5 rounded-lg font-semibold text-sm ${
                  plan.highlight
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "border border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-500 border-t">
        © 2026 PinCart AI. All rights reserved.
      </footer>
    </div>
  );
}
