import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
const menuItems = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Explore",
    href: "/explore",
  },
  {
    title: "Transactions",
    href: "/transactions",
  },
  {
    title: "Blog",
    href: "/blog",
  },
  {
    title: "About Us",
    href: "/about-us",
  },
  {
    title: "Contact Us",
    href: "/contact-us",
  },
];
export default function Nav() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname;

  return (
    <nav
      key="navbar-top"
      className="bg-white shadow-green-400 dark:bg-gray-800 dark:text-white"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div>
              <a href="#" className="flex items-center py-4 px-2">
                <div className="h-10">
                  <Image
                    priority={true}
                    key="navbar-top-image"
                    src="/images/nav-logo.svg"
                    alt="Logo"
                    height={40}
                    width={200}
                  />
                </div>
                <span className="hidden font-semibold text-gray-400 text-lg">
                  Grassroots Economics
                </span>
              </a>
            </div>
            <div className="hidden md:flex items-center space-x-1">
              {menuItems.map((item) => {
                const active = isActive(item.href)
                  ? "font-light text-green-500 border-b-2 border-green-500"
                  : "font-light text-gray-400  hover:text-green-500 transition duration-300";
                return (
                  <a
                    href={item.href}
                    className={`py-4 px-2 font-semibold ${active}`}
                  >
                    {item.title}
                  </a>
                );
              })}
            </div>
          </div>
          <div className="md:hidden flex items-center">
            <button
              className="outline-none mobile-menu-button"
              onClick={() => setOpen(!open)}
            >
              <svg
                className=" w-6 h-6 text-gray-400 hover:text-green-500 "
                x-show="!showMenu"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      {open && (
        <div className="mobile-menu">
          <ul className="">
            {menuItems.map((item) => {
              const active = isActive(item.href)
                ? "text-white bg-green-500 font-semibold"
                : "hover:bg-green-500 transition duration-300";
              return (
                <li className="active">
                  <a
                    href={item.href}
                    className={`block text-sm px-2 py-4 ${active}`}
                  >
                    {item.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
}
