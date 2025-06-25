export default function Footer() {
  return (
    <footer
      className="text-white text-sm text-center py-6"
      style={{ backgroundColor: 'var(--color-deep)' }}
    >
      © {new Date().getFullYear()} QuickFund. All rights reserved.
    </footer>
  );
}
