import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyJobs from "../../../src/pages/MyJobs";

const mockNavigate = vi.fn();

const jobsServiceMocks = vi.hoisted(() => ({
  getMyJobs: vi.fn(),
  deleteJob: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../../src/services/jobsService", () => ({
  default: {
    getMyJobs: jobsServiceMocks.getMyJobs,
    deleteJob: jobsServiceMocks.deleteJob,
  },
}));

describe("MyJobs recruiter flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads recruiter jobs and shows edit/delete actions", async () => {
    jobsServiceMocks.getMyJobs.mockResolvedValueOnce([
      {
        id: "job-1",
        title: "Frontend Developer",
        company: "Acme",
        location: "TLV",
      },
    ]);

    render(<MyJobs />);

    expect(await screen.findByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /delete frontend developer/i }),
    ).toBeInTheDocument();
  });

  it("opens delete confirmation and removes job after successful delete", async () => {
    const user = userEvent.setup();

    jobsServiceMocks.getMyJobs.mockResolvedValueOnce([
      {
        id: "job-9",
        title: "Recruiter Test Job",
        company: "Acme",
        location: "TLV",
      },
    ]);
    jobsServiceMocks.deleteJob.mockResolvedValueOnce({ success: true });

    render(<MyJobs />);

    await screen.findByText("Recruiter Test Job");

    await user.click(
      screen.getByRole("button", { name: /delete recruiter test job/i }),
    );
    expect(
      screen.getByRole("dialog", { name: "Delete this job?" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Delete permanently" }),
    );

    await waitFor(() => {
      expect(jobsServiceMocks.deleteJob).toHaveBeenCalledWith("job-9");
    });

    expect(screen.queryByText("Recruiter Test Job")).not.toBeInTheDocument();
    expect(
      screen.getByText(/deleted "recruiter test job" successfully/i),
    ).toBeInTheDocument();
  });

  it("shows empty state and allows navigating to create job", async () => {
    const user = userEvent.setup();

    jobsServiceMocks.getMyJobs.mockResolvedValueOnce([]);

    render(<MyJobs />);

    await screen.findByText("No jobs posted yet");

    await user.click(
      screen.getByRole("button", { name: "Publish Your First Job" }),
    );

    expect(mockNavigate).toHaveBeenCalledWith("/create/jobs");
  });
});
