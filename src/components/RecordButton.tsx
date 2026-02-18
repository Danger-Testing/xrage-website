"use client";

type RecordButtonProps = {
  isRecording: boolean;
  isProcessing: boolean;
  onToggle: () => void;
};

export function RecordButton({ isRecording, isProcessing, onToggle }: RecordButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      disabled={isProcessing}
      aria-label={isProcessing ? "Processing GIF" : isRecording ? "Stop recording" : "Start recording"}
      className={`
        fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg cursor-pointer
        flex items-center gap-2 transition-all duration-200
        ${isProcessing
          ? "bg-gray-600 text-gray-300 cursor-wait"
          : isRecording
            ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
            : "bg-white/20 hover:bg-white/30 text-white border border-white/30"
        }
      `}
    >
      {isProcessing ? (
        <>
          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Processing...
        </>
      ) : isRecording ? (
        <>
          <span className="w-3 h-3 bg-white rounded-full" />
          Stop
        </>
      ) : (
        <>
          <span className="w-3 h-3 bg-red-500 rounded-full" />
          Record
        </>
      )}
    </button>
  );
}
