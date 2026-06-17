import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const dummyData = [
  { month: "Jan", applications: 5, interviews: 2, resumeScore: 70, skillGrowth: 3 },
  { month: "Feb", applications: 8, interviews: 3, resumeScore: 72, skillGrowth: 4 },
  { month: "Mar", applications: 6, interviews: 2, resumeScore: 74, skillGrowth: 5 },
  { month: "Apr", applications: 10, interviews: 4, resumeScore: 76, skillGrowth: 6 },
  { month: "May", applications: 12, interviews: 5, resumeScore: 78, skillGrowth: 7 },
];

const PersonalDashboard = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Personal Dashboard</h2>

      {/* Career Progress (Applications & Interviews) */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Career Progress</h3>
        <LineChart width={600} height={300} data={dummyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="applications" stroke="#8884d8" name="Applications" />
          <Line type="monotone" dataKey="interviews" stroke="#82ca9d" name="Interviews" />
        </LineChart>
      </div>

      {/* Skills Growth */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Skills Growth</h3>
        <BarChart width={600} height={300} data={dummyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="skillGrowth" fill="#ffc658" name="Skill Growth (points)" />
        </BarChart>
      </div>

      {/* Resume Score Trend */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Resume Score Trend</h3>
        <LineChart width={600} height={300} data={dummyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="resumeScore" stroke="#ff7300" name="Resume Score" />
        </LineChart>
      </div>

      {/* Application Trend */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Application Trend</h3>
        <BarChart width={600} height={300} data={dummyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="applications" fill="#8884d8" name="Applications Sent" />
        </BarChart>
      </div>

      {/* Interview History */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Interview History</h3>
        <BarChart width={600} height={300} data={dummyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="interviews" fill="#82ca9d" name="Interviews" />
        </BarChart>
      </div>
    </div>
  );
};

export default PersonalDashboard;