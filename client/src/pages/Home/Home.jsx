import Card from '../../components/Card';

export default function Home() {
  return (
    <div className="page active">
      <div className="hero">
        <h1>Welcome to InternTrack</h1>
        <p>Track internships, submit weekly reports, approve progress and generate certificates.</p>
        <div className="cards">
          <Card title="Student Portal" description="Submit internship details and weekly reports." link="/student/dashboard" />
          <Card title="Teacher Portal" description="Monitor internship progress of students." link="/teacher/dashboard" />
          <Card title="Manager Portal" description="Approve reports and evaluate students." link="/manager/dashboard" />
        </div>
      </div>
    </div>
  );
}