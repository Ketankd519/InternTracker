import Sidebar from '../../components/Sidebar';
import ProgressBar from '../../components/ProgressBar';

export default function StudentDashboard() {
  return (
    <div className="dashboard">
      <Sidebar title="Student" items={['Dashboard', 'Internship', 'Weekly Report', 'Progress', 'Certificate']} />
      <div className="content">
        <h2>Student Dashboard</h2>
        <div className="stats">
          <div className="box"><h3>Internship</h3><p>Active</p></div>
          <div className="box"><h3>Week</h3><p>4 / 8</p></div>
          <div className="box"><h3>Status</h3><p>Verified</p></div>
        </div>
        
        <h3>Progress</h3>
        <ProgressBar progress={50} />

        <form onSubmit={(e) => e.preventDefault()}>
          <h3>Internship Details</h3>
          <input placeholder="Company Name" />
          <input placeholder="Manager Name" />
          <input type="date" />
          <input type="date" />
          <input placeholder="Internship Role" />
          <button className="btn" type="button">Save</button>
        </form>

        <form onSubmit={(e) => e.preventDefault()}>
          <h3>Weekly Report</h3>
          <input placeholder="Week Number" />
          <input placeholder="Task Title" />
          <textarea rows="5" placeholder="Describe your weekly work"></textarea>
          <button className="btn" type="button">Submit Report</button>
        </form>
      </div>
    </div>
  );
} 