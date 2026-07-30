import {
  Gamepad2, Flame, Award, Trophy, Star, Crown, Coins, Users, Palette, Sparkles,
  Target, Zap, Shield, Gift, Heart, Medal, Rocket, Brain, Lock, Eye,
  Wand2, PartyPopper, Diamond, TrendingUp, Calendar, Clock, Sword, Brush,
  Dumbbell, Coffee, Mountain, Flag, Lightbulb, Puzzle, Compass, PawPrint,
  Bell, Bookmark, CheckCircle2, ShoppingBag, Share2, MessageSquare,
  Camera, Home, Settings, User, Smile, Pencil, BookOpen, Moon, Globe,
  Worm, Grid3x3, Candy, Feather, Droplets, LayoutGrid,
} from "lucide-react";
import type { ComponentType } from "react";

/** Maps achievement/challenge icon string names to lucide-react components */
export const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  Gamepad2, Flame, Award, Trophy, Star, Crown, Coins, Users, Palette, Sparkles,
  Target, Zap, Shield, Gift, Heart, Medal, Rocket, Brain, Lock, Eye,
  Wand2, PartyPopper, Diamond, TrendingUp, Calendar, Clock, Sword, Brush,
  Dumbbell, Coffee, Mountain, Flag, Lightbulb, Puzzle, Compass, PawPrint,
  Bell, Bookmark, CheckCircle2, ShoppingBag, Share2, MessageSquare,
  Camera, Home, Settings, User, Smile, Pencil, BookOpen, Moon, Globe,
  Worm, Grid3x3, Candy, Feather, Droplets, LayoutGrid,
};