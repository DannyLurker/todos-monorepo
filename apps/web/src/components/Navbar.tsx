import { Link, NavLink, useNavigate } from "react-router-dom";
import { authClient } from "@repo/auth/client";
import { Button } from "@/components/ui/button";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive
      ? "text-foreground underline underline-offset-4"
      : "text-muted-foreground hover:text-foreground"
  }`;

export default function Navbar() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  const handleLogout = async () => {
    await authClient.signOut();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-semibold text-sm tracking-tight">
            Todos App
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/" className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/todos" className={linkClass}>
              Todos
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isPending ? (
            <span className="text-xs text-muted-foreground">Loading...</span>
          ) : session?.user ? (
            <>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {session.user.name || session.user.email}
              </span>
              {role && (
                <span className="rounded bg-secondary px-2 py-0.5 text-[11px] font-semibold">
                  {role}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button variant="default" size="sm" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
