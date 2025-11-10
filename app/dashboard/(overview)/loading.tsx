// . Any UI you add in loading.tsx will be embedded as part of the static file, and sent first. Then, the rest of the dynamic content will be streamed from the server to the client.

import DashboardSkeleton from "@/app//ui/skeletons";
const loading = () => {
  return (
    <div>
      loading.....
      <DashboardSkeleton />
    </div>
  );
};

export default loading;
