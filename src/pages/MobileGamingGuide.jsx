import { Link } from "react-router-dom";
import { PawPrint } from "lucide-react";

export default function MobileGamingGuide() {
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
          <h1 className="font-heading text-xl font-bold">
            The Casual Mobile Gaming Guide
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 pb-28 space-y-6">
        <section className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Casual mobile gaming has evolved into one of the most significant
            entertainment mediums of the modern era. What began as simple
            time-killers on early smartphones has grown into a rich ecosystem of
            beautifully crafted experiences that millions of people enjoy every
            single day. The appeal is straightforward: games that are easy to
            pick up but difficult to master, playable in short bursts during a
            commute, a lunch break, or a quiet evening at home. Nya Hub embraces
            this philosophy by bringing together a curated collection of arcade
            and puzzle games under a single, cohesive hub — eliminating the need
            to download a dozen separate apps just to have variety.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The best casual games share a few core qualities. First, they respect
            the player's time: sessions are short, progress is always saved, and
            there is no penalty for stepping away. Second, they offer meaningful
            progression — whether through levels, leaderboards, achievements, or
            collectibles — so every session feels rewarding even if it only lasts
            five minutes. Third, they feature intuitive touch controls that feel
            natural on a phone screen, whether that means swiping to swap candies,
            dragging blocks onto a grid, or tapping to sort colorful liquids. Nya
            Hub's game library is designed around exactly these principles, with
            each title offering its own unique mechanics while sharing a consistent,
            cat-themed visual identity that makes the whole hub feel like home.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Puzzle games, in particular, have proven to be the backbone of the
            casual gaming world. Match-three games, block-stacking puzzles, number
            logic challenges, and color-sorting brain teasers all tap into the
            same deeply satisfying loop: present a problem, let the player solve
            it, and reward them with satisfying feedback. Research in game design
            has shown that this loop triggers genuine cognitive benefits —
            improved pattern recognition, faster decision-making, and even stress
            reduction. When these mechanics are wrapped in a welcoming, charming
            aesthetic with soft colors and friendly characters, the result is an
            experience that feels less like "gaming" and more like a relaxing
            mental exercise. That is precisely the experience Nya Hub aims to
            deliver with every game in its collection.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Looking ahead, the future of casual mobile gaming is about community
            and connection. Leaderboards that let you measure yourself against
            players worldwide, daily challenges that give you a reason to come
            back, friend systems that turn solo play into shared experiences, and
            achievement catalogs that celebrate every milestone — these are the
            features that transform a collection of games into a living hub. Nya
            Hub is built from the ground up with all of these systems integrated,
            so every game you play contributes to a larger, connected progression
            that spans the entire hub. Whether you are chasing the top spot on the
            global rankings or just trying to earn your next achievement, Nya Hub
            is designed to be your go-to destination for high-quality, casual,
            cat-themed mobile fun.
          </p>
        </section>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-heading text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <PawPrint className="w-4 h-4" /> Explore Nya Hub
          </Link>
        </div>
      </main>
    </div>
  );
}