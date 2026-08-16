// import html2pdf from 'html2pdf.js';

export default function Certificate() {
  // const downloadPDF = () => {
  //   const element = document.getElementById('printable-certificate');
  //   const opt = {
  //     margin:       0.5,
  //     filename:     'Internship_Certificate.pdf',
  //     image:        { type: 'jpeg', quality: 0.98 },
  //     html2canvas:  { scale: 2 },
  //     jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
  //   };
  //   html2pdf().set(opt).from(element).save();
  // };

  return (
    <div className="page active">
      <h2 style={{ textAlign: 'center', color: '#1e3a8a' }}>
        Internship Completion Certificate
      </h2>

      <div className="certificate" id="printable-certificate">
        <h1>Certificate of Internship Completion</h1>
        <p>This is to certify that</p>
        <h2>Rahul Sharma</h2>
        <p>has successfully completed an internship at</p>
        <h2>ABC Technologies Pvt Ltd</h2>
        <p>Duration:</p>
        <h3>01 June 2026 - 31 July 2026</h3>
        <br />
        <p>During this internship, the student worked on web development projects and successfully completed assigned tasks.</p>
        <br /><br />
        <table>
          <thead>
            <tr>
              <th>Verified By</th>
              <th>Approved By</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Company Manager</td>
              <td>College Teacher</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button className="btn" onClick={downloadPDF}>Download Certificate (PDF)</button>
      </div> */}
    </div>
  );
}