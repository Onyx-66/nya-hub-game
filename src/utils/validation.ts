import { MIN_PSEUDONYM_LENGTH, MAX_PSEUDONYM_LENGTH } from "./constants";

/** Validates a pseudonym: 3–20 chars, alphanumeric + spaces + Arabic. */
export function isValidPseudonym(name: string): boolean {
  if (name.length < MIN_PSEUDONYM_LENGTH || name.length > MAX_PSEUDONYM_LENGTH) return false;
  return /^[a-zA-Z0-9\s\u0600-\u06FF]+$/.test(name);
}

/** Strips HTML tags from user input to prevent XSS. */
export function sanitizeInput(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}