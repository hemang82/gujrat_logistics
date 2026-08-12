"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "Do I need to install any software on my computer?",
    answer: "No, Trust Logistic is a 100% cloud-based Transport Management System (TMS). You can access it securely from any web browser on your computer, laptop, or mobile phone without downloading anything."
  },
  {
    question: "Is my transport data secure?",
    answer: "Absolutely. We use enterprise-grade encryption to protect your LRs, client ledgers, and driver documents. Your data is backed up daily and is strictly confidential."
  },
  {
    question: "Can I manage multiple branches or transport hubs?",
    answer: "Yes, our software is built for multi-branch operations. You can track crossing memos, inter-branch material transfers, and branch-wise profitability from a single admin dashboard."
  },
  {
    question: "Does it support Auto Freight Calculation and TDS?",
    answer: "Yes. Simply enter the weight or quantity, and the system automatically calculates total freight, applies TDS deductions, Hamali charges, and tracks driver advances perfectly."
  },
  {
    question: "How long does it take to generate a Lorry Receipt (LR)?",
    answer: "With our optimized workflow, generating a fully formatted, digital Lorry Receipt (Bilty) takes less than 10 seconds. You can then instantly share it with your clients via WhatsApp or email."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600">Everything you need to know about India's top transport software.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border rounded-2xl overflow-hidden transition-colors ${openIndex === index ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <button
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-gray-900 text-lg pr-8">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 text-gray-400"
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
