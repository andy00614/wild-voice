# Voice Clone Dialog Component

A modular, well-structured component for cloning voices with file upload and recording capabilities.

## 📁 File Structure

```
voice-clone-dialog/
├── index.tsx                    # Main dialog component (107 lines)
├── types.ts                     # Type definitions (16 lines)
├── voice-clone-form.tsx         # Form component (121 lines)
├── audio-source-tabs.tsx        # Tab container (67 lines)
├── file-upload-tab.tsx          # File upload tab (46 lines)
├── recording-tab.tsx            # Recording tab (113 lines)
├── audio-preview.tsx            # Audio preview player (19 lines)
├── hooks/
│   ├── useVoiceClone.ts         # Voice clone logic (123 lines)
│   └── useAudioRecording.ts     # Recording logic (105 lines)
└── utils/
    └── file-validation.ts       # File validation utility (22 lines)
```

## 🎯 Component Responsibilities

### Main Components

- **index.tsx**: Dialog wrapper, orchestrates all sub-components
- **voice-clone-form.tsx**: Form structure and validation
- **audio-source-tabs.tsx**: Tabs for upload/record modes
- **file-upload-tab.tsx**: File upload UI and handling
- **recording-tab.tsx**: Recording UI with number prompts
- **audio-preview.tsx**: Audio playback preview

### Hooks

- **useVoiceClone.ts**: Form state, file handling, API submission
- **useAudioRecording.ts**: Recording state, MediaRecorder API

### Utils

- **file-validation.ts**: Audio file type and size validation

## 🚀 Usage

```tsx
import { VoiceCloneDialog } from "@/components/voice-clone-dialog";

function MyComponent() {
    const [open, setOpen] = useState(false);

    return (
        <VoiceCloneDialog open={open} onOpenChange={setOpen} />
    );
}
```

## ✨ Features

- **Dual Input Modes**: File upload or native audio recording
- **Number Reading Prompt**: Generates random numbers for users to read
- **Audio Preview**: Built-in audio player for uploaded/recorded files
- **Validation**: File type and size validation
- **Error Handling**: Clear error messages
- **Loading States**: Disabled inputs during submission

## 📝 Type Safety

All types are defined in `types.ts` and shared across components for consistency.

## 🔧 Customization

Each component is self-contained and can be customized independently without affecting others.
