import { LogOut, Mic } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/modules/auth/components/logout-button";
import { getSession } from "@/modules/auth/utils/auth-utils";

export async function Navigation() {
    const session = await getSession();

    return (
        <nav className="border-b bg-white sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="text-xl font-bold text-gray-900 flex items-center gap-2"
                        >
                            <Mic className="h-5 w-5 text-primary" />
                            WildVoice
                        </Link>
                        <span className="text-sm text-muted-foreground">
                            Talk. Transform. Clone.
                        </span>
                    </div>

                    {session?.user && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">
                                {session.user.name}
                            </span>
                            <LogoutButton />
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
