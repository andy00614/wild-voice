import { useRef } from "react";
import { Label } from "@/components/ui/label";

interface AudioPreviewProps {
    audioUrl: string;
}

export function AudioPreview({ audioUrl }: AudioPreviewProps) {
    const audioElementRef = useRef<HTMLAudioElement | null>(null);

    return (
        <div className="space-y-2">
            <Label>Preview</Label>
            <audio ref={audioElementRef} controls className="w-full">
                <source src={audioUrl} />
            </audio>
        </div>
    );
}
