import { useState } from "react";
import { Link } from "react-router-dom";
import { PawPrint, Mail, Send } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/"
            className="w-11 h-11 rounded-2xl bg-muted/60 flex items-center justify-center shrink-0 hover:bg-muted transition-colors"
            aria-label="Back to home"
          >
            <PawPrint className="w-5 h-5 text-primary" />
          </Link>
          <h1 className="font-heading text-xl font-bold">Contact Us</h1>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 pb-28 space-y-6">
        <p className="text-muted-foreground leading-relaxed">
          Have a question, suggestion, or just want to say hello? We would love
          to hear from you. Reach out using the form below or email us directly.
        </p>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-border/50">
          <Mail className="w-5 h-5 text-primary shrink-0" />
          <a
            href="mailto:support@nyahub.app"
            className="text-sm font-medium text-primary hover:underline"
          >
            support@nyahub.app
          </a>
        </div>

        {sent ? (
          <div className="p-6 rounded-2xl bg-primary/10 border border-primary/30 text-center space-y-2">
            <p className="font-heading text-lg font-bold text-primary">
              Message Sent!
            </p>
            <p className="text-sm text-muted-foreground">
              Thanks for reaching out. We will get back to you as soon as possible.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-heading font-semibold mb-1.5">
                Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-heading font-semibold mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-heading font-semibold mb-1.5">
                Message
              </label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="How can we help?"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-heading text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" /> Send Message
            </button>
          </form>
        )}
      </main>
    </div>
  );
}