import JobCardSkeleton from "./JobCardSkeleton.jsx";

function JobCardSkeletonStack({ count = 3 }) {
  return Array.from({ length: count }, (_, index) => (
    <JobCardSkeleton key={`job-card-skeleton-${index}`} />
  ));
}

export default JobCardSkeletonStack;
