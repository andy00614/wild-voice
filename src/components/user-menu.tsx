"use client";

import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/modules/auth/actions/auth.action";
import authRoutes from "@/modules/auth/auth.route";

interface UserMenuProps {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
    };
}

export function UserMenu({ user }: UserMenuProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            const result = await signOut();
            if (result.success) {
                router.push(authRoutes.login);
                router.refresh();
            } else {
                console.error("Logout failed:", result.message);
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Get user initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                >
                    {user.image ? (
                        <img
                            src={user.image}
                            alt={user.name}
                            className="h-9 w-9 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                            {getInitials(user.name)}
                        </div>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {user.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={handleLogout}
                    disabled={isLoading}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isLoading ? "Logging out..." : "Log out"}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
