import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen text-3xl font-bold flex items-center justify-center">
      <span>
        Are you Lost? go{" "}
        <Link href={"/"} className="underline">
          Home
        </Link>
      </span>
    </div>
  );
}
