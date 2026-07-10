import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (location.pathname === "/") return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-text-light mb-6 select-none">
      <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1.5 font-medium">
        <Home className="h-4 w-4" /> Home
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const name = value.replace("-", " ").replace("_", " ");

        return (
          <React.Fragment key={to}>
            <ChevronRight className="h-4 w-4 text-text-muted" />
            {isLast ? (
              <span className="text-primary-dark font-semibold capitalize">{name}</span>
            ) : (
              <Link to={to} className="hover:text-primary transition-colors capitalize font-medium">
                {name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
