import { Cog } from "lucide-react";
export default function Loading() {
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <span className="text-2xl font-bold">Loading...</span>
      <Cog className="animate-spin h-10 w-10 text-gray-500" />
    </div>
  );
}
