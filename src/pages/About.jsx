import { Link } from "react-router-dom";
import { PawPrint, Mail, BookOpen } from "lucide-react";

export default function About() {
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
          <h1 className="font-heading text-xl font-bold">About Nya Hub</h1>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 pb-28 space-y-6">
        <section className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Nya Hub is a premium mobile gaming destination that brings together a
            diverse collection of high-quality arcade and puzzle games into one
            seamless, beautifully designed hub. Inspired by beloved classics and
            modern casual gaming experiences, Nya Hub offers something for every
            type of player — from quick brain teasers to deep, satisfying
            progression systems that keep you coming back for more.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The app is built for mobile gamers who want a polished, all-in-one
            experience without the clutter of ads or the friction of jumping
            between a dozen separate apps. Whether you are a commuter looking for
            a five-minute puzzle break, a competitive player chasing the top of
            the global leaderboards, or someone who simply enjoys collecting
            achievements and customizing their profile, Nya Hub has been crafted
            with you in mind. Every game features intuitive touch controls,
            cat-themed charm, and a consistent visual language so you always feel
            at home.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Nya Hub is developed by a small, passionate team of designers and
            engineers who believe that mobile gaming should be delightful,
            fair, and accessible to everyone. We are committed to continuously
            expanding the hub with new games, seasonal challenges, and community
            features. Our mission is simple: to be the go-to destination for
            casual gamers who value quality, variety, and a touch of whimsy in
            their everyday play.
          </p>
        </section>

        <div className="flex gap-3 pt-2">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-heading text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Mail className="w-4 h-4" /> Contact Us
          </Link>
          <Link
            to="/mobile-gaming-guide"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-muted text-foreground font-heading text-sm font-semibold hover:bg-muted/70 transition-colors"
          >
            <BookOpen className="w-4 h-4" /> Gaming Guide
          </Link>
        </div>
      </main>
    </div>
  );
}