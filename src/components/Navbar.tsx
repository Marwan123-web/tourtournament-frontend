"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const t = useTranslations("navbar");
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { href: "/tournaments", label: t("tournaments") },
    { href: "/fields", label: t("fields") },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          Tournaments
        </Link>

        <div className="flex items-center space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`hover:text-primary transition-colors ${
                pathname === item.href ? "text-primary font-semibold" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}

          {user ? (
            <>
              <Link
                href="/profile"
                className="hover:text-primary transition-colors"
              >
                <span className="text-sm text-muted-foreground hidden md:inline">
                  {t("welcome", {
                    name: user.name || user.username || t("user"),
                  })}
                </span>
              </Link>
              <Button onClick={handleLogout} variant="outline" size="sm">
                {t("logout")}
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button>{t("login")}</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
