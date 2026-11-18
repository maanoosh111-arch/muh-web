import React from 'react';
import { motion } from 'motion/react';
import type { ProcessStep } from '../types/site';

interface ProcessGridProps {
  tag: string;
  title: string;
  steps: ProcessStep[];
  id?: string;
}

export function ProcessGrid({ tag, title, steps, id = 'process' }: ProcessGridProps) {
  return (
    <section
      id={id}
      className="relative bg-black py-16 sm:py-24 px-4 sm:px-6 overflow-hidden border-t border-white/[0.06]"
    >
      <div className="relative z-10 max-w-[1400px] mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 flex flex-col items-center"
        >
          <span className="block text-white/85 text-xs sm:text-sm font-medium tracking-[0.22em] uppercase mb-3">
            {tag}
          </span>
          <h2 className="font-display text-2xl sm:text-4xl lg:text-[44px] font-black text-white uppercase tracking-tight leading-[1.15] text-balance max-w-4xl">
            {title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {steps.map((step, index) => (
            <motion.div
              key={`${step.title}-${index}`}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="bg-[#0d0d0f] border border-white/10 hover:border-[#ff0d1b]/50 rounded-xl p-6 flex items-start gap-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.8),0_0_20px_rgba(255,13,27,0.15)]"
            >
              <div className="w-7 h-7 min-w-[28px] rounded-full bg-[#ff0d1b] text-white text-xs font-display font-extrabold flex items-center justify-center shadow-[0_2px_10px_rgba(255,13,27,0.45)] mt-0.5">
                {index + 1}
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-display text-white text-sm sm:text-[15px] font-extrabold tracking-wide uppercase leading-snug">
                  {step.title}
                </h3>
                <p className="text-white/65 text-xs leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
