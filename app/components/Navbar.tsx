"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <div>
      <nav className="navbar navbar-expand-sm bg-body-tertiary">
        <div className="container-fluid">
          <Link className="navbar-brand" href="#">Smart Advisor</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav me-auto">
              <Link className="nav-link active" aria-current="page" href="#">Home</Link>
              <Link className="nav-link" href="#">Features</Link>
              <Link className="nav-link" href="#">Pricing</Link>
              <Link className="nav-link" href="#">Test</Link>
            </div>

            <div className="navbar-nav ms-auto">
              <Link className="nav-link" href="#">Login</Link>
              <Link className="nav-link" href="#">Register</Link>
              <Link className="nav-link" href="#">Logout</Link>
              <Link className="nav-link" href="#">Profile</Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}