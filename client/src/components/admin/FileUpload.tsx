import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, Image, Music, Video, FileIcon, Loader2, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  accept: "image" | "audio" | "video" | "any";
  value: string;
  onChange: (url: string) => void;
  onUploadStateChange?: (isUploading: boolean) => void;
  maxSize?: number;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

const ACCEPT_MAP: Record<string, string> = {
  image: "image/png,image/jpeg,image/webp,image/gif,image/avif",
  audio: "audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/ogg,audio/mp4,audio/x-m4a,audio/aac",
  video: "video/mp4,video/webm,video/quicktime,video/x-m4v",
  any: "image/png,image/jpeg,image/webp,image/gif,image/avif,audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/ogg,audio/mp4,audio/x-m4a,audio/aac,video/mp4,video/webm,video/quicktime,video/x-m4v",
};

const FORMAT_LABELS: Record<string, string> = {
  image: "PNG, JPG, WebP, GIF, AVIF",
  audio: "MP3, WAV, OGG, M4A, AAC",
  video: "MP4, WebM, MOV, M4V",
  any: "Images, Audio, Video",
};

function getFileIcon(accept: string) {
  switch (accept) {
    case "image": return Image;
    case "audio": return Music;
    case "video": return Video;
    default: return FileIcon;
  }
}

function isImageUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.match(/\.(png|jpg|jpeg|webp|gif|avif|svg)(\?.*)?$/) !== null ||
    lower.startsWith("/images/") ||
    lower.startsWith("/objects/") ||
    lower.includes("/uploads/images/") ||
    lower.includes("/objects/uploads/");
}

function normalizeMediaUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/uploads/")) return `/objects${trimmed}`;
  if (trimmed.startsWith("uploads/")) return `/objects/${trimmed}`;
  return trimmed;
}

export function FileUpload({
  accept,
  value,
  onChange,
  onUploadStateChange,
  maxSize = 50,
  label,
  required,
  placeholder,
}: FileUploadProps) {
  const [displayUrl, setDisplayUrl] = useState(value || "");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayUrl(normalizeMediaUrl(value || ""));
  }, [value]);

  useEffect(() => {
    onUploadStateChange?.(isUploading);
  }, [isUploading, onUploadStateChange]);

  const Icon = getFileIcon(accept);

  const handleFile = useCallback(async (file: File) => {
    setError(null);

    const maxBytes = maxSize * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File too large. Maximum size is ${maxSize}MB.`);
      return;
    }

    const acceptedTypes = ACCEPT_MAP[accept].split(",");
    if (!acceptedTypes.includes(file.type)) {
      setError(`Invalid file type. Accepted: ${FORMAT_LABELS[accept]}`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 15, 90));
      }, 200);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      const normalizedUrl = normalizeMediaUrl(data.url || "");
      setUploadProgress(100);
      setTimeout(() => {
        setDisplayUrl(normalizedUrl);
        onChange(normalizedUrl);
        setIsUploading(false);
        setUploadProgress(0);
      }, 300);
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [accept, maxSize, onChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [handleFile]);

  const handleUrlSubmit = useCallback(() => {
    if (urlInputValue.trim()) {
      const url = normalizeMediaUrl(urlInputValue);
      setDisplayUrl(url);
      onChange(url);
      setUrlInputValue("");
      setShowUrlInput(false);
    }
  }, [urlInputValue, onChange]);

  const handleRemove = useCallback(() => {
    setDisplayUrl("");
    setError(null);
    onChange("");
  }, [onChange]);

  const hasValue = !!displayUrl && !isUploading;
  const showImagePreview = hasValue && (accept === "image" || accept === "any") && isImageUrl(displayUrl);

  return (
    <div className="space-y-2" data-testid={`file-upload-${accept}`}>
      {label && (
        <label className="text-xs font-semibold flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_MAP[accept]}
        onChange={handleInputChange}
        className="hidden"
      />

      {hasValue ? (
        <div className="border rounded-lg p-3 bg-card dark:bg-[#1A1225] dark:border-[#2A1E35]">
          <div className="flex items-center gap-3">
            {showImagePreview ? (
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={displayUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary-lighter/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-primary dark:text-primary-lighter" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate dark:text-gray-200">{displayUrl.split("/").pop()}</p>
              <p className="text-xs text-muted-foreground truncate">{displayUrl}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs"
                data-testid="button-replace-file"
              >
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-destructive hover:text-destructive"
                data-testid="button-remove-file"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {accept === "audio" && displayUrl && (
            <div className="mt-2 pt-2 border-t dark:border-[#2A1E35]">
              <audio controls src={displayUrl} className="w-full h-8" preload="metadata" />
            </div>
          )}
        </div>
      ) : (
        <>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
              "hover:border-primary/50 hover:bg-primary/5",
              "dark:hover:border-primary-lighter/50 dark:hover:bg-primary-lighter/5",
              isDragging && "border-primary bg-primary/10 dark:border-primary-lighter dark:bg-primary-lighter/10",
              error && "border-destructive/50",
              !isDragging && !error && "border-muted-foreground/25 dark:border-[#2A1E35]"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            data-testid="dropzone"
          >
            {isUploading ? (
              <div className="space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary dark:text-primary-lighter" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
                <Progress value={uploadProgress} className="h-2 max-w-[200px] mx-auto" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary-lighter/10 flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5 text-primary dark:text-primary-lighter" />
                </div>
                <p className="text-sm font-medium dark:text-gray-200">
                  {placeholder || "Drop your file here or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {FORMAT_LABELS[accept]} — Max {maxSize}MB
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-destructive flex items-center gap-1" data-testid="upload-error">
              <X className="w-3 h-3" /> {error}
            </p>
          )}

          {!isUploading && (
            <div>
              {showUrlInput ? (
                <div className="flex gap-2 items-center">
                  <Input
                    value={urlInputValue}
                    onChange={(e) => setUrlInputValue(e.target.value)}
                    placeholder="https://example.com/file.png"
                    className="text-sm h-8"
                    onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                    data-testid="input-url-fallback"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleUrlSubmit}
                    disabled={!urlInputValue.trim()}
                    className="h-8 px-3"
                    data-testid="button-submit-url"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUrlInput(false)}
                    className="h-8 px-2"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-primary dark:hover:text-primary-lighter flex items-center gap-1 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setShowUrlInput(true); }}
                  data-testid="button-paste-url"
                >
                  <Link2 className="w-3 h-3" /> Or paste a URL instead
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
