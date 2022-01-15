import React from "react";
import { Search } from "../Search/Search";
import "./Header.css";

export const Header = () => {
  return (
    <div className="header">
      <h1 className="header__title">Abstract</h1>
      <div className="header__search">
        <Search></Search>
      </div>
    </div>
  );
};
