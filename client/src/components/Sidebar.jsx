export default function Sidebar({ title, items = [] }) {
  return (
    <div className="sidebar">
      <h2>{title}</h2>

      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}