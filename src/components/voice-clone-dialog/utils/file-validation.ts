export function validateAudioFile(file: File): string | null {
    console.log("Validating file:", file);
    // Validate file type
    const validTypes = [
        "audio/mp3",
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/m4a",
        "audio/aac",
    ];

    console.log(file.type);
    if (!validTypes.includes(file.type)) {
        return "Please upload a valid audio file (MP3, WAV, OGG, M4A)";
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
        return "File size cannot exceed 20MB";
    }

    return null;
}
