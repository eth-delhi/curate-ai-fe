"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  MessageSquare,
  Clock,
  FlameIcon as Fire,
} from "lucide-react";

export const RightSidebar = () => {
  const [animateNotification, setAnimateNotification] = useState(false);

  // Animation triggers
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimateNotification(true);
      setTimeout(() => setAnimateNotification(false), 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-100 fixed right-0 top-12 h-screen py-8 px-6 bg-white overflow-y-auto">
      <div className="space-y-8">
        {/* Newsletter Section */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center mb-2">
            <h3 className="font-bold text-lg text-gray-900">Stay Updated</h3>
            <div
              className={`w-2 h-2 rounded-full bg-blue-500 ml-2 transition-transform duration-300 ${
                animateNotification ? "scale-125" : "scale-100"
              }`}
            />
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Get the latest insights and analysis delivered to your inbox weekly.
          </p>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Your email address"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-900 placeholder-gray-500 transition-all"
            />
            <button className="w-full py-2.5 text-sm font-medium text-white bg-[#0077b6] hover:bg-blue-700 rounded-md transition-all duration-200 transform hover:scale-105">
              Subscribe
            </button>
          </div>
        </div>

        {/* Trending Section */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" /> Trending
          </h3>
          <div className="space-y-4">
            {[
              {
                title: "Why TypeScript is Taking Over Frontend Development",
                count: "374",
              },
              {
                title: "Building a Full-Stack App with Next.js and Supabase",
                count: "290",
              },
              {
                title: "The Future of Web3: Beyond the Hype",
                count: "295",
              },
              {
                title: "Mastering React Server Components",
                count: "353",
              },
              {
                title: "How to Optimize Your Docker Containers",
                count: "216",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group hover:bg-blue-50 rounded-lg p-3 transition-all duration-200 cursor-pointer transform hover:scale-105"
                style={{
                  animationDelay: `${0.6 + index * 0.1}s`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="font-bold text-blue-400 text-sm mt-0.5">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                      <Fire className="w-3.5 h-3.5 text-amber-500" />
                      <span>{item.count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discuss Section */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-blue-500" /> Discussions
          </h3>
          <div className="space-y-4">
            {[
              {
                title: "What's your favorite VS Code extension?",
                comments: "17",
                time: "3h",
              },
              {
                title: "Unpopular opinion: TypeScript is overrated",
                comments: "52",
                time: "9h",
              },
              {
                title: "How do you stay productive as a developer?",
                comments: "54",
                time: "5h",
              },
              {
                title: "React vs. Vue vs. Svelte: Your thoughts?",
                comments: "8",
                time: "11h",
              },
              {
                title: "What's your debugging workflow?",
                comments: "18",
                time: "11h",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group hover:bg-blue-50 rounded-lg p-3 transition-all duration-200 cursor-pointer transform hover:scale-105"
                style={{
                  animationDelay: `${0.8 + index * 0.1}s`,
                }}
              >
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                    <span>{item.comments}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
