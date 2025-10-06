import { useRef } from "react";
import { Upload } from "lucide-react";

interface FileUploadTabProps {
    audioFile: File | null;
    onFileChange: (file: File | null) => void;
    disabled?: boolean;
}

export function FileUploadTab({
    audioFile,
    onFileChange,
    disabled,
}: FileUploadTabProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        onFileChange(file || null);
    };

    return (
        <div className="space-y-4">
            <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
            >
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                    {audioFile ? audioFile.name : "Click to upload audio file"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    Supports all audio formats (at least 10 seconds). Will be converted to MP3 automatically.
                </p>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
            />
        </div>
    );
}
