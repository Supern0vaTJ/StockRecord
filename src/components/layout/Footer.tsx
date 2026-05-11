export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center leading-relaxed max-w-2xl mx-auto">
          <strong className="text-zinc-500 dark:text-zinc-400">Disclaimer:</strong> This website is not an investment advisory tool. It is provided solely for educational purposes and personal portfolio management.
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center mt-2">
          © {new Date().getFullYear()} StudioSupern0va_TJ. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
