import { Suspense } from "react";
import { Dashboard } from "./Dashboard";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => (
  <Suspense fallback={<Skeleton />}>
    <Dashboard />
  </Suspense>
);
export default Index;
