/* tslint:disable */
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// --- QUOTES DATA ---
const quotes = [
  { 
    text: "Sikkim is a land of majestic mountains, serene monasteries, and vibrant culture, a true jewel of the Himalayas.",
    author: "A Traveler's Journal" 
  },
  { 
    text: "To travel in Sikkim is to be humbled by nature's grandeur and touched by the warmth of its people.",
    author: "Himalayan Echoes" 
  },
  {
    text: "The air in Sikkim is so pure, it feels like you're breathing in peace itself.",
    author: "Anonymous"
  },
  {
    text: "Every corner of Sikkim holds a story, whispered by the prayer flags and ancient stones.",
    author: "Local Proverb"
  },
  {
    text: "Sikkim is not just a destination, it's an experience that stays with you long after you've left.",
    author: "Explorer's Diary"
  },
];

// --- COUNTER DATA ---
const stats = {
  monasteries: 200,
  hilltops: 150,
  archives: 5000,
};

/**
 * Sets a daily quote on the page.
 */
function setDailyQuote() {
  const quoteTextEl = document.getElementById('daily-quote-text');
  const quoteAuthorEl = document.getElementById('daily-quote-author');

  if (quoteTextEl && quoteAuthorEl) {
    // Get day of the year to ensure the quote changes daily
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    const quoteIndex = dayOfYear % quotes.length;
    const selectedQuote = quotes[quoteIndex];

    quoteTextEl.textContent = `"${selectedQuote.text}"`;
    quoteAuthorEl.textContent = `— ${selectedQuote.author}`;
  }
}

/**
 * Animates a number from 0 to a target value.
 * @param el The DOM element to update.
 * @param target The final number.
 * @param duration The animation duration in ms.
 */
function animateCount(el: HTMLElement, target: number, duration: number = 2000) {
  let start = 0;
  const end = target;
  let startTime: number | null = null;

  function animation(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const progress = Math.min((currentTime - startTime) / duration, 1);
    
    const currentCount = Math.floor(progress * (end - start) + start);
    el.textContent = currentCount.toLocaleString() + (target >= 1000 ? '+' : '');

    if (progress < 1) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

/**
 * Initializes all the dynamic content on the page.
 */
function initializePage() {
  setDailyQuote();

  const monasteriesEl = document.getElementById('monasteries-count');
  const hilltopsEl = document.getElementById('hilltops-count');
  const archivesEl = document.getElementById('archives-count');

  if (monasteriesEl && hilltopsEl && archivesEl) {
    animateCount(monasteriesEl, stats.monasteries);
    animateCount(hilltopsEl, stats.hilltops);
    animateCount(archivesEl, stats.archives);
  }
}

// Run initialization logic after the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', initializePage);
