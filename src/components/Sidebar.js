"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: "Listen Now", href: "/", icon: HomeIcon },
    { name: "Browse", href: "/browse", icon: RectangleStackIcon },
    { name: "Artists", href: "/artists", icon: UsersIcon },
    { name: "Albums", href: "/albums", icon: RectangleStackIcon },
  ];

  return (
    <aside className="fixed w-[260px] h-screen bg-black/95 backdrop-blur-xl border-r border-white/10">
      <div className="p-6">
        <h1 className="text-xl font-bold mb-8 bg-gradient-to-r from-[#ff2d55] to-[#ff375f] bg-clip-text text-transparent">
          Music
        </h1>

        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`sidebar-link ${
                pathname === item.href ? "active" : ""
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
