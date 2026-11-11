import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbfbfd] dark:bg-[#000000] text-black dark:text-white px-6 text-center select-none">
      <div className="max-w-md">
        <p className="text-[14px] font-semibold tracking-wider text-apple-blue uppercase mb-2">
          404 Error
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-[-0.03em] mb-4">
          Page not found.
        </h1>
        <p className="text-base text-black/60 dark:text-white/60 mb-8 font-normal leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-medium text-[15px] hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue"
        >
          Return to VAULT
        </Link>
      </div>
    </div>
  );
}
