import React from "react";

const Footer = () => {
  const currentYear = new Date(Date.now()).getFullYear();
  return (
    <footer
      style={{ alignSelf: "flex-end", bottom: "0" }}
      className="w-100 dark-light mt-5"
    >
      <div className="text-center py-3">
        <p className="text-warning" style={{ fontSize: "0.75rem" }}>
          Warning: The server and database will be reset{" "}
          <strong>17. December 19:00 CET </strong>
        </p>
        {/* © {currentYear} Copyright */}
        <div className="py-2">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/Ojself/cyberwarfare4k"
          >
            CyberhackerWarfare4000
          </a>{" "}
          0.1.0
        </div>
      </div>
    </footer>
  );
};

export default Footer;
