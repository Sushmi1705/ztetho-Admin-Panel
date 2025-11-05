import { useEffect, useState } from "react";
import { apiService } from "../services/apiService";
import "../styles/_dashboard.scss";

function ReportedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await apiService.getReported("jobs");
        setJobs(data || []);
      } catch (err) {
        setError("Failed to load reported jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) return <p>Loading reported jobs...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="reported-container">
      <h2>Reported Jobs</h2>
      {jobs.length === 0 ? (
        <p>No reported jobs found</p>
      ) : (
        <table className="reported-table">
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Title</th>
              <th>Reported By</th>
              <th>Reason</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, i) => (
              <tr key={i}>
                <td>{job.jobId}</td>
                <td>{job.title}</td>
                <td>{job.reportedBy}</td>
                <td>{job.reason}</td>
                <td>{new Date(job.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ReportedJobs;
