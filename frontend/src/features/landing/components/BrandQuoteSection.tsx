import { Quote } from 'lucide-react';

export function BrandQuoteSection() {
  return (
    <section id="quote-statement" className="oceanlens-quote-section">
      {/* Enterprise ambient background spotlight */}
      <div className="quote-ambient-spotlight" aria-hidden="true" />

      {/* Glassmorphism brand statement panel */}
      <div className="quote-glass-panel">
        <div className="quote-icon-mark" aria-hidden="true">
          <Quote size={24} />
        </div>
        <blockquote className="quote-main-statement">
          &ldquo;Data turns uncertainty into opportunity.&rdquo;
        </blockquote>
        <p className="quote-secondary-text">
          A CLEANER, SMARTER, MORE CONNECTED ENERGY FUTURE
        </p>
      </div>
    </section>
  );
}
