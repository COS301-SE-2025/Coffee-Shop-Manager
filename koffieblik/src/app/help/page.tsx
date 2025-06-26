'use client';
import React, { useState } from 'react';

const faqs = [
  {
    question: "How do I create an account?",
    answer: "Customers can sign up using the 'Register' button on the homepage.",
  },
  {
    question: "How do I place an order?",
    answer: "Customers can log in and use the dashboard to browse items and place an order through the Point of Sale system.",
  },
  {
    question: "Where can I track my order?",
    answer: "Once you've placed an order, go to your dashboard and click on 'Order History' to view real-time tracking updates.",
  },
  {
    question: "How do I access reports as an employee?",
    answer: "After logging in, employees can navigate to the 'Reports' tab from the dashboard to view sales and inventory summaries.",
  },
  {
    question: "What should I do if I forget my password?",
    answer: "Use the 'Forgot Password' link on the login page. Follow the instructions sent to your registered email to reset your password.",
  },
  {
    question: "Can customers view order history?",
    answer: "Yes, customers can view all past orders by visiting the 'Order History' section from the dashboard.",
  },
  {
    question: "Who can use the POS system?",
    answer: "The POS system is designed for employees to place orders.",
  }
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1
        className="text-3xl font-bold mb-6"
        style={{ color: 'var(--primary-3)' }}
      >
        Frequently Asked Questions
      </h1>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-xl shadow transition"
            style={{
              border: '1px solid var(--primary-3)',
              backgroundColor: 'var(--primary-2)',
            }}
          >

            <button
              onClick={() => toggleFAQ(index)}
              className="w-full text-left p-4 font-semibold flex justify-between items-center"
              style={{ color: 'var(--primary-3)' }}
            >

              {faq.question}
              <span className="text-2xl" style={{ color: 'var(--primary-3)' }}>
                {openIndex === index ? '−' : '+'}
              </span>

            </button>
            {openIndex === index && (
              <div className="p-4 pt-0" style={{ color: 'var(--primary-3)' }}>
                {faq.answer}
              </div>

            )}
          </div>
        ))}
      </div>

      <div
        className="mt-16 text-center p-8 rounded-2xl shadow-sm border"
        style={{
          backgroundColor: 'var(--primary-2)',
          borderColor: 'var(--primary-3)',
        }}
      >

        <h3
          className="text-2xl font-bold mb-4"
          style={{ color: 'var(--primary-1)' }}
        >
          Still need help?
        </h3>

        <p
          className="mb-6 max-w-2xl mx-auto"
          style={{ color: 'var(--primary-1)' }}
        >
          Can't find what you're looking for? Contact our support team.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn px-8 py-3 hover:scale-105 transform">
            Email Support
          </button>

          <button className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200 hover:scale-105 transform">
            Call support
          </button>
        </div>
      </div>
    </div>
  );
}