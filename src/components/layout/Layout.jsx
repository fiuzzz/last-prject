// src/components/Layout.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faBell,
  faUser,
  faSearch,
  faSignOut
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "./Layout.css";

const Layout = ({ children }) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const menuItems = [
    { path: "/", name: "Beranda", icon: faHome },
    { path: "/aktivitas", name: "Aktivitas", icon: faBell },
    { path: "/profile", name: "Profile", icon: faUser },
  ];

  return (
    <div className="layout-container">
      <header className="layout-header">
        <div className="header-content">
          <h1 className="header-title">Alumni Connect</h1>
        </div>
      </header>

      <div className="layout-body">
        <aside className="layout-sidebar">
          <div className="sidebar-with-search">
            {/* Search Input */}
            <div className="sidebar-search">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Cari alumni..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Search Results - Muncul di atas sidebar */}
            {searchQuery && (
              <div className="search-results-absolute">
                <div className="search-results-container">
                  {isSearching ? (
                    <div className="loading-spinner"></div>
                  ) : searchResults.length > 0 ? (
                    <ul className="results-list">
                      {searchResults.map((profile) => (
                        <li key={profile.id} className="result-item">
                          <Link
                            to={`/profil/${profile.id}`}
                            className="result-link"
                          >
                            <img
                              src={profile.foto || "/default-avatar.png"}
                              alt={profile.nama}
                              className="profile-avatar"
                            />
                            <div className="profile-info">
                              <span className="profile-username">
                                {profile.username ||
                                  profile.nama.toLowerCase().replace(/\s/g, "")}
                              </span>
                              <span className="profile-name">
                                {profile.nama}
                              </span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="no-results">
                      <p>Tidak ada hasil ditemukan</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sidebar Menu */}
            <nav>
              <ul className="sidebar-menu">
                {menuItems.map((item) => (
                  <li
                    key={item.path}
                    className={`menu-item ${
                      location.pathname === item.path ? "active" : ""
                    }`}
                  >
                    <Link to={item.path} className="menu-link">
                      <FontAwesomeIcon icon={item.icon} className="menu-icon" />
                      <span className="menu-text">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              
            </nav>
          </div>
        </aside>

        <main className="layout-content">
          <div className="content-wrapper">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
