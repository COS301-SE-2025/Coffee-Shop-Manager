"use client";
import React, { useState } from "react";

// Example: Replace with your fetched data from Supabase
const pointsData = [
  { date: "2025-09-27", points: 50 },
  { date: "2025-09-26", points: 40 },
  { date: "2025-09-01", points: 30 },
  { date: "2025-08-15", points: 20 },
  { date: "2024-09-27", points: 60 },
];

const faqs = [
  {
    question: "How do I create an account?",
    answer:
      "Customers can sign up using the 'Register' button on the homepage.",
  },
  {
    question: "How do I place an order?",
    answer:
      "Customers can log in and use the dashboard to browse items and place an order through the Point of Sale system.",
  },
  {
    question: "Where can I track my order?",
    answer:
      "Once you've placed an order, go to your dashboard and click on 'Order History' to view real-time tracking updates.",
  },
  {
    question: "How do I access reports as an employee?",
    answer:
      "After logging in, employees can navigate to the 'Reports' tab from the dashboard to view sales and inventory summaries.",
  },
  {
    question: "What should I do if I forget my password?",
    answer:
      "Use the 'Forgot Password' link on the login page. Follow the instructions sent to your registered email to reset your password.",
  },
  {
    question: "Can customers view order history?",
    answer:
      "Yes, customers can view all past orders by visiting the 'Order History' section from the dashboard.",
  },
  {
    question: "Who can use the POS system?",
    answer: "The POS system is designed for employees to place orders.",
  },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [graphFilter, setGraphFilter] = useState<"day" | "month" | "year">(
    "month"
  );

  const toggleFAQ = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Filter UI */}
      <div className="mb-6 flex gap-4">
        <button
          className={`px-4 py-2 rounded-lg font-semibold border cursor-pointer ${graphFilter === "day"
              ? "bg-[var(--primary-2)] text-[var(--primary-3)]"
              : "bg-[var(--primary-3)] text-[var(--primary-2)]"
            }`}
          onClick={() => setGraphFilter("day")}
        >
          Day
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold border cursor-pointer ${graphFilter === "month"
              ? "bg-[var(--primary-2)] text-[var(--primary-3)]"
              : "bg-[var(--primary-3)] text-[var(--primary-2)]"
            }`}
          onClick={() => setGraphFilter("month")}
        >
          Month
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold border cursor-pointer ${graphFilter === "year"
              ? "bg-[var(--primary-2)] text-[var(--primary-3)]"
              : "bg-[var(--primary-3)] text-[var(--primary-2)]"
            }`}
          onClick={() => setGraphFilter("year")}
        >
          Year
        </button>
      </div>

      <h1
        className="text-3xl font-bold mb-6"
        style={{ color: "var(--primary-2)" }}
      >
        Frequently Asked Questions
      </h1>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-xl shadow transition backdrop-blur-sm overflow-hidden"
            style={{
              border: "1px solid var(--primary-4)",
              backgroundColor: "var(--primary-3)",
            }}
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full text-left p-4 font-semibold flex justify-between items-center cursor-pointer"
              style={{ color: "var(--primary-2)" }}
            >
              {faq.question}
              <span
                className="text-2xl transition-transform duration-300"
                style={{
                  color: "var(--primary-2)",
                  transform:
                    openIndex === index ? "rotate(0deg)" : "rotate(90deg)",
                }}
              >
                {openIndex === index ? "−" : "+"}
              </span>
            </button>
            <div
              className="transition-all duration-300 ease-in-out origin-top"
              style={{
                maxHeight: openIndex === index ? "500px" : "0",
                opacity: openIndex === index ? 1 : 0,
                overflow: "hidden",
                backgroundColor: "var(--primary-4)", // Add this line for background color
              }}
            >
              <div
                className="p-4 pt-0"
                style={{
                  color: "var(--primary-1)", // Change text color to primary-1
                  borderTop: "1px solid var(--primary-2)", // Optional: adds a separator line
                }}
              >
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-16 text-center p-8 rounded-2xl shadow-sm border backdrop-blur-sm"
        style={{
          backgroundColor: "var(--primary-3)",
          borderColor: "var(--primary-4)",
        }}
      >
        <h3
          className="text-2xl font-bold mb-4"
          style={{ color: "var(--primary-2)" }}
        >
          Still need help?
        </h3>

        <p
          className="mb-6 max-w-2xl mx-auto"
          style={{ color: "var(--primary-2)" }}
        >
          Can't find what you're looking for? Contact our support team.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:cos301capstonegroup9@gmail.com"
            className="px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 transform cursor-pointer inline-block text-center"
            style={{
              backgroundColor: "var(--primary-2)",
              color: "var(--primary-3)",
              textDecoration: "none"
            }}
          >
            Email Support
          </a>
        </div>
      </div>
    </div>
  );
}
