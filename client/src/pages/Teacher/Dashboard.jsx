import Sidebar from '../../components/Sidebar';
import Table from '../../components/Table';

export default function TeacherDashboard() {
  const students = [
    { name: 'Rahul', company: 'ABC Pvt Ltd', week: 4, status: 'Approved' },
    { name: 'Priya', company: 'XYZ Tech', week: 3, status: 'Pending' }
  ];

  return (
    <div className="dashboard">
      <Sidebar title="Teacher" items={['Dashboard', 'Students', 'Reports', 'Analytics']} />
      <div className="content">
        <h2>Teacher Dashboard</h2>
        <div className="stats">
          <div className="box"><h3>Total Students</h3><p>120</p></div>
          <div className="box"><h3>Active</h3><p>85</p></div>
          <div className="box"><h3>Completed</h3><p>35</p></div>
        </div>

        <Table 
          headers={['Student', 'Company', 'Week', 'Status']}
          data={students}
          renderRow={(row, idx) => (
            <tr key={idx}>
              <td>{row.name}</td>
              <td>{row.company}</td>
              <td>{row.week}</td>
              <td>{row.status}</td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}