import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const dummyData = [
  { month: 'Jan', applications: 20, interviews: 5, offers: 2, rejections: 13, atsScore: 70 },
  { month: 'Feb', applications: 30, interviews: 8, offers: 3, rejections: 19, atsScore: 68 },
  { month: 'Mar', applications: 25, interviews: 7, offers: 4, rejections: 14, atsScore: 72 },
  { month: 'Apr', applications: 35, interviews: 10, offers: 5, rejections: 20, atsScore: 75 },
  { month: 'May', applications: 40, interviews: 12, offers: 6, rejections: 22, atsScore: 78 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A'];

const AnalyticsDashboard = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>

      {/* Applications Sent Over Time */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Applications Sent</h3>
        <LineChart width={600} height={300} data={dummyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="applications" stroke="#8884d8" />
        </LineChart>
      </div>

      {/* Interview, Offer, Rejection Rates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <BarChart width={300} height={250} data={dummyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="interviews" fill="#82ca9d" name="Interviews" />
        </BarChart>

        <BarChart width={300} height={250} data={dummyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="offers" fill="#8884d8" name="Offers" />
        </BarChart>

        <BarChart width={300} height={250} data={dummyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="rejections" fill="#ff7300" name="Rejections" />
        </BarChart>
      </div>

      {/* ATS Score Trend */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">ATS Score Trend</h3>
        <LineChart width={600} height={300} data={dummyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="atsScore" stroke="#ff7300" name="ATS Score" />
        </LineChart>
      </div>

      {/* Offer Rate Pie */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Offer Rate Distribution</h3>
        <PieChart width={400} height={300}>
          <Pie
            data={[
              { name: 'Offers', value: dummyData.reduce((sum, d) => sum + d.offers, 0) },
              { name: 'Rejections', value: dummyData.reduce((sum, d) => sum + d.rejections, 0) },
            ]}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {[
              { name: 'Offers', value: dummyData.reduce((sum, d) => sum + d.offers, 0) },
              { name: 'Rejections', value: dummyData.reduce((sum, d) => sum + d.rejections, 0) },
            ].map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;