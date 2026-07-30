import { Link } from "react-router-dom";
import { PawPrint } from "lucide-react";

export default function PuzzleGamesGuide() {
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
            Puzzle Games: A Deep Dive into Brain-Training Fun
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 pb-28 space-y-6">
        <section className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Puzzle games have been a cornerstone of mobile gaming since the
            earliest days of the smartphone revolution. From the simple
            satisfaction of matching three identical items to the deep strategic
            thinking required to solve a complex logic grid, puzzle games occupy
            a unique space in the gaming world. They are equally appealing to
            hardcore gamers looking for a mental challenge and to casual players
            who simply want a relaxing way to unwind. Nya Hub embraces this
            diversity by offering a wide range of puzzle experiences — including
            match-three games like Nya Crush, block-stacking challenges like
            Block Blast, color-sorting brainteasers like Water Sort, and number
            logic puzzles like Meowdoku — all within a single, beautifully
            designed hub.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            What makes a great puzzle game? The answer lies in the delicate
            balance between accessibility and depth. A well-designed puzzle game
            should be understandable within seconds — the player should know
            exactly what to do without reading a manual. But beneath that simple
            surface, there should be layers of strategy that reveal themselves
            over time. Match-three games achieve this by introducing special
            candies, combo chains, and board layouts that reward forward
            thinking. Block-stacking games add spatial reasoning and the
            ever-present threat of running out of room. Water sort games test
            planning and patience as you carefully pour liquids between tubes
            without mixing colors. Sudoku-style number puzzles build logical
            deduction skills that transfer to everyday problem-solving. Each
            genre exercises a different cognitive muscle, which is why having a
            variety of puzzle types in one place — as Nya Hub provides — is so
            valuable for players who want a well-rounded mental workout.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Beyond pure entertainment, puzzle games offer genuine cognitive
            benefits that have been documented by researchers studying the
            intersection of gaming and brain health. Regular engagement with
            puzzle games has been linked to improved working memory, faster
            pattern recognition, enhanced spatial reasoning, and even a reduction
            in cognitive decline associated with aging. The key is consistency:
            short, daily sessions are far more beneficial than occasional
            marathon plays. This is precisely why mobile puzzle games are so
            effective — they fit naturally into the micro-moments of daily life.
            A five-minute session while waiting for a bus, a quick level during
            a lunch break, or a relaxing puzzle before bed can all contribute to
            maintaining sharp mental faculties over time.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Nya Hub takes the puzzle gaming experience a step further by
            wrapping every game in a cohesive, cat-themed universe complete with
            achievements, leaderboards, and daily challenges. This means that
            every puzzle you solve contributes to a larger meta-progression —
            earning paws and gems, unlocking profile customization options, and
            climbing the global rankings against players from around the world.
            The social and competitive layers transform what could be isolated
            puzzle sessions into a connected, community-driven experience. Whether
            you are a puzzle purist who loves the quiet satisfaction of a perfect
            solution or a competitive player who wants to top the leaderboards,
            Nya Hub's puzzle collection offers the depth, variety, and charm to
            keep your brain engaged and entertained every single day.
          </p>
        </section>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-heading text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <PawPrint className="w-4 h-4" /> Play Puzzle Games
          </Link>
        </div>
      </main>
    </div>
  );
}