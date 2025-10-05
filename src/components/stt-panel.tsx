"use client";

import { Card } from "@/components/ui/card";
import { Mic } from "lucide-react";

export function STTPanel() {
    return (
        <Card className="p-6">
            <div className="flex flex-col items-center mb-6">
                <Mic className="w-12 h-12 text-purple-600 mb-2" />
                <h2 className="text-2xl font-semibold">Speech to Text</h2>
            </div>

            <div className="text-center py-12 text-gray-500">
                <p>Speech to Text feature coming soon...</p>
            </div>
        </Card>
    );
}
