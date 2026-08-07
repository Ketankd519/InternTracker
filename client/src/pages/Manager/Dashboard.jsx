import Sidebar from '../../components/Sidebar';
import Table from '../../components/Table';

export default function ManagerDashboard() {
  const reports = [
    { name: 'Rahul', week: 4, report: 'Web Module' },
    { name: 'Priya', week: 3, report: 'Testing' }
  ];

  return (
    <div className="dashboard">
      <Sidebar title="Manager" items={['Dashboard', 'Approvals', 'Evaluation']} />
      <div className="content">
        <h2>Manager Dashboard</h2>
        <Table 
          headers={['Student', 'Week', 'Report', 'Action']}
          data={reports}
          renderRow={(row, idx) => (
            <tr key={idx}>
              <td>{row.name}</td>
              <td>{row.week}</td>
              <td>{row.report}</td>
              <td><button className="btn">Approve</button></td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}