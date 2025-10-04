import Image from "next/image";
import { getSession } from "@/modules/auth/utils/auth-utils";

export default async function Page() {
    const session = await getSession();
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            {!session && <p>No active session found.</p>}
            {session && (
                <div>
                    <p className="mb-2">Welcome, {session.user?.name}!</p>
                    <p>Your email: {session.user?.email}</p>
                    <p>
                        Your role:{" "}
                        <Image
                            width={24}
                            height={24}
                            className="inline-block w-6 h-6 mr-1"
                            src={session.user?.image as string}
                            alt={session.user?.name}
                        />
                    </p>
                </div>
            )}
        </div>
    );
}
