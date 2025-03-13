function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 py-3 px-6 text-center text-xs text-neutral-500">
      <p>
        © 2025 Joule Finance |{" "}
        <a
          href="#"
          className="text-primary-600 hover:text-primary-700 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </a>{" "}
        |{" "}
        <a
          href="#"
          className="text-primary-600 hover:text-primary-700 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of Service
        </a>
      </p>
    </footer>
  );
}

export default Footer;
