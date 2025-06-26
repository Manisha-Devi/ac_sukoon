
import React from 'react';

function RecentActivity() {
  return (
    <div className="recent-activity">
      <h3>Recent Activity</h3>
      <div className="activity-list">
        <div className="activity-item">
          <span className="activity-icon">🎫</span>
          <div className="activity-details">
            <p>Fare collected: Ghuraka to Bhaderwah - ₹2,500</p>
            <small>2 hours ago</small>
          </div>
        </div>
        <div className="activity-item">
          <span className="activity-icon">⛽</span>
          <div className="activity-details">
            <p>Fuel expense added - ₹3,200</p>
            <small>4 hours ago</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecentActivity;
