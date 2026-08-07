export default function ProgressBar({ progress }) {
  return (
    <div className="progress">
      <div style={{ width: `${progress}%` }}></div>
    </div>
  );
}