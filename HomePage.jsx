import React from "react";
import { Bell, Calendar, Clipboard, DollarSign, Mail } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white p-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="text-2xl">☰</div>
          <h1 className="text-2xl font-semibold text-gray-800">EventHive</h1>
        </div>
        <Bell className="text-gray-600" />
      </div>

      {/* Upcoming Section */}
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Upcoming</h2>

      {/* April Events */}
      <div className="mb-4">
        <h3 className="text-md font-semibold text-gray-600 mb-2">April</h3>
        <div className="bg-yellow-300 rounded-lg p-3 flex items-center justify-between">
          <div className="bg-yellow-700 text-white text-sm p-2 rounded mr-4 text-center">
            <div className="font-bold">18</div>
            <div>Tue</div>
          </div>
          <div className="text-white">
            <div className="text-sm">7:00 PM - 12:00 AM</div>
            <div className="font-semibold">Naomi’s Pool Party</div>
          </div>
        </div>
      </div>

      {/* June Events */}
      <div className="mb-8">
        <h3 className="text-md font-semibold text-gray-600 mb-2">June</h3>
        <div className="bg-yellow-300 rounded-lg p-3 flex items-center justify-between">
          <div className="bg-yellow-700 text-white text-sm p-2 rounded mr-4 text-center">
            <div className="font-bold">13</div>
            <div>Wed</div>
          </div>
          <div className="text-white">
            <div className="text-sm">8:00 PM - 12:00 AM</div>
            <div className="font-semibold">Alana’s Cat Party</div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-yellow-300 p-4 rounded-2xl flex flex-col items-center shadow-md">
          <Clipboard />
          <span className="mt-2 font-medium">Plan</span>
        </button>
        <button className="bg-yellow-100 p-4 rounded-2xl flex flex-col items-center shadow-md">
          <Mail />
          <span className="mt-2 font-medium">Invites</span>
        </button>
        <button className="bg-yellow-100 p-4 rounded-2xl flex flex-col items-center shadow-md">
          <Calendar />
          <span className="mt-2 font-medium">Events</span>
        </button>
        <button className="bg-yellow-100 p-4 rounded-2xl flex flex-col items-center shadow-md">
          <DollarSign />
          <span className="mt-2 font-medium">Money</span>
        </button>
      </div>
    </div>
  );
}
