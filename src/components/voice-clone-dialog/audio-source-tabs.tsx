import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploadTab } from "./file-upload-tab";
import { RecordingTab } from "./recording-tab";
import type { ReadingPrompt } from "./types";

interface AudioSourceTabsProps {
    audioFile: File | null;
    onFileChange: (file: File | null) => void;
    isRecording: boolean;
    isConverting: boolean;
    recordedBlob: Blob | null;
    recordingDuration: number;
    readingPrompt: ReadingPrompt | null;
    formatTime: (seconds: number) => string;
    onStartRecording: () => void;
    onStopRecording: () => void;
    onResetRecording: () => void;
    disabled?: boolean;
}

export function AudioSourceTabs({
    audioFile,
    onFileChange,
    isRecording,
    isConverting,
    recordedBlob,
    recordingDuration,
    readingPrompt,
    formatTime,
    onStartRecording,
    onStopRecording,
    onResetRecording,
    disabled,
}: AudioSourceTabsProps) {
    return (
        <div className="space-y-2">
            <Label>Audio Source *</Label>
            <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload File</TabsTrigger>
                    <TabsTrigger value="record">Record</TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                    <FileUploadTab
                        audioFile={audioFile}
                        onFileChange={onFileChange}
                        disabled={disabled}
                    />
                </TabsContent>

                <TabsContent value="record">
                    <RecordingTab
                        isRecording={isRecording}
                        isConverting={isConverting}
                        recordedBlob={recordedBlob}
                        recordingDuration={recordingDuration}
                        readingPrompt={readingPrompt}
                        formatTime={formatTime}
                        onStartRecording={onStartRecording}
                        onStopRecording={onStopRecording}
                        onResetRecording={onResetRecording}
                        disabled={disabled}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
