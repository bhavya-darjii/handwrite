import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

interface StatsModuleProps {
  totalUsers: number;
  totalRequestsCount: number;
  completedCount: number;
  suggestionsCount: number;
  isLoadingUsers: boolean;
  monthlyData: any[];
  statusData: any[];
  onFetchUsers: () => void;
  // Credit Update Props
  globalCreditAmount: number | "";
  setGlobalCreditAmount: (val: number | "") => void;
  handleGlobalCreditUpdate: () => void;
  isUpdatingCredits: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ background: "rgba(0,0,0,0.8)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
        <p className="label" style={{ color: "#fff", margin: 0 }}>{`${label} : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const StatsModule: React.FC<StatsModuleProps> = ({
  totalUsers,
  totalRequestsCount,
  completedCount,
  suggestionsCount,
  isLoadingUsers,
  monthlyData,
  statusData,
  onFetchUsers,
  globalCreditAmount,
  setGlobalCreditAmount,
  handleGlobalCreditUpdate,
  isUpdatingCredits,
}) => {
  return (
    <>
      <div className="admin-stats-grid">
        {/* STATS CARDS */}
        <div className="admin-stat-card admin-clickable-card" onClick={onFetchUsers} title="Click to view all users">
          <h4 className="stat-label">Total Users</h4>
          <span className="stat-value">{isLoadingUsers ? "" : totalUsers}</span>
          <div className="stat-icon-bg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="admin-click-indicator">Click to expand →</div>
        </div>

        <div className="admin-stat-card">
          <h4 className="stat-label">Total Requests</h4>
          <span className="stat-value">{totalRequestsCount}</span>
          <div className="stat-icon-bg" style={{ background: "rgba(255, 204, 0, 0.2)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffcc00" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>
        </div>

        <div className="admin-stat-card">
          <h4 className="stat-label">Completed Fonts</h4>
          <span className="stat-value" style={{ color: "#00ff88" }}>{completedCount}</span>
          <div className="stat-icon-bg" style={{ background: "rgba(0, 255, 136, 0.2)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>

        <div className="admin-stat-card">
          <h4 className="stat-label">Feedback</h4>
          <span className="stat-value">{suggestionsCount}</span>
          <div className="stat-icon-bg" style={{ background: "rgba(255, 0, 85, 0.2)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff0055" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
        </div>

        {/* CHARTS */}
        <div className="admin-chart-container full-width">
          <h3 className="chart-title">Request Volume (Monthly)</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffcc00" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ffcc00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Requests" stroke="#ffcc00" strokeWidth={3} fillOpacity={1} fill="url(#colorReq)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-chart-container">
          <h3 className="chart-title">Request Status</h3>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" stroke="none">
                  {statusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#00ff88" : "#ff4444"} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", fontSize: "0.8rem", color: "#ccc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: 10, height: 10, background: "#00ff88", borderRadius: "50%" }}></div> Completed
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: 10, height: 10, background: "#ff4444", borderRadius: "50%" }}></div> Pending
              </div>
            </div>
          </div>
        </div>

        <div className="admin-chart-container">
          <h3 className="chart-title">Credit Usage (Est.)</h3>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyData}>
                <XAxis dataKey="name" stroke="#666" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Requests" fill="#5500ff" radius={[10, 10, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DANGER ZONE */}
        <div className="admin-chart-container full-width" style={{ marginTop: "0", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 className="chart-title" style={{ marginBottom: "0.5rem", color: "#ff4444" }}>Danger Zone</h3>
          <div style={{ background: "rgba(255, 68, 68, 0.05)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255, 68, 68, 0.2)" }}>
            <h4 style={{ margin: "0 0 1rem 0", color: "#ffaaaa", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px" }}>Set Global Credits</h4>
            <p style={{ color: "#ccc", fontSize: "0.85rem", marginBottom: "1.5rem", lineHeight: "1.4" }}>
              <b>Warning:</b> This action will overwrite the credit balance for <u>every single user</u> in the database. <br />
              Use this to reset or grant monthly quotas to everyone at once.
            </p>
            <div className="admin-actions-row">
              <input
                type="number"
                value={globalCreditAmount}
                onChange={(e) => setGlobalCreditAmount(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Enter Amount"
                className="admin-input"
              />
              <button onClick={handleGlobalCreditUpdate} disabled={isUpdatingCredits || globalCreditAmount === ""} className="admin-danger-btn">
                {isUpdatingCredits ? "Updating Database..." : "Set Credits for All Users"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatsModule;