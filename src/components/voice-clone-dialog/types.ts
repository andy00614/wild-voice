export interface VoiceCloneDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export interface RandomNumber {
    value: number;
    id: string;
}

export interface ReadingPrompt {
    numbers: number[];
    date: string;
    phoneNumber: string;
}

export interface VoiceCloneFormData {
    name: string;
    category: string;
    audioFile: File | null;
    recordedBlob: Blob | null;
}
