import { useParams } from "react-router-dom";

function JobDetails() {
  const { id } = useParams();

  return (
    <main>
      <h1>Job Details</h1>
      <p>Viewing job #{id}</p>
    </main>
  );
}

export default JobDetails;
