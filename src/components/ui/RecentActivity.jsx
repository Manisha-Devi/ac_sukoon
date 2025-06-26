
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
import React from 'react';

function RecentActivity() {
  const activities = [
    {
      icon: '🎫',
      title: 'Fare Collection',
      description: 'Ghuraka to Bhaderwah - ₹450',
      time: '2 hours ago'
    },
    {
      icon: '⛽',
      title: 'Fuel Purchase',
      description: 'Diesel - 40L for ₹3,200',
      time: '4 hours ago'
    },
    {
      icon: '🔧',
      title: 'Service Entry',
      description: 'Engine oil change - ₹850',
      time: '1 day ago'
    },
    {
      icon: '💰',
      title: 'Bonus Calculated',
      description: 'Driver bonus for December - ₹2,500',
      time: '2 days ago'
    }
  ];

  return (
    <div className="recent-activity">
      <h3>Recent Activity</h3>
      <div className="activity-list">
        {activities.map((activity, index) => (
          <div key={index} className="activity-item">
            <div className="activity-icon">
              {activity.icon}
            </div>
            <div className="activity-details">
              <p><strong>{activity.title}</strong></p>
              <p>{activity.description}</p>
              <small>{activity.time}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentActivity;
