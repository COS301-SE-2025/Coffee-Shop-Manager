import Image from "next/image";
import Link from "next/link";

export default function Home() {

  const HeadingColors="text-3xl font-bold tracking-tight text-brown-800";
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-[#fdf6f0] text-[#4b2e2e]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-center text-center">
        <Image
          src="/icon.svg"
          alt="KoffieBlik Logo"
          width={180}
          height={38}
          priority
        />
        <h1 className={HeadingColors}>Welcome to KoffieBlik</h1>
        <p className="text-lg max-w-md">
          Your cozy coffee shop. Start your journey with us by logging in or registering below.
        </p>

        <div className="flex gap-4 mt-4 flex-col sm:flex-row">
          <Link href="/login" passHref>
            <button className="rounded-full bg-[#4b2e2e] text-white hover:bg-[#6b3e3e] transition-colors px-6 py-3 text-base font-medium">
              Login
            </button>
          </Link>
          <Link href="/register" passHref>
            <button className="rounded-full border border-[#4b2e2e] text-[#4b2e2e] hover:bg-[#f2eae2] transition-colors px-6 py-3 text-base font-medium">
              Register
            </button>
          </Link>
        </div>
      </main>

      <footer className="row-start-3 text-sm text-[#6e4e4e]">
        KoffieBlik. Brewed with love ☕
      </footer>
    </div>
  );
}
