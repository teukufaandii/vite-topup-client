import { useState, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onFileSelect: (file: File | null) => void;
  label?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "banner";
}

export const ImageUpload = ({
  value,
  onChange,
  onFileSelect,
  label = "Image",
  className,
  aspectRatio = "square",
}: ImageUploadProps) => {
  const [useUrlInput, setUseUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    banner: "aspect-[3/1]",
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    onChange(objectUrl);
    onFileSelect(file);
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
    onFileSelect(null);
  };

  const handleRemove = () => {
    onChange("");
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setUseUrlInput(!useUrlInput)}
          className="text-xs"
        >
          {useUrlInput ? "Upload File" : "Use URL"}
        </Button>
      </div>

      {useUrlInput ? (
        <div className="space-y-2">
          <Input
            value={value}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="Enter image URL..."
          />
          {value && (
            <div
              className={cn(
                "relative rounded-lg overflow-hidden bg-muted",
                aspectRatioClass[aspectRatio],
              )}
            >
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => handleRemove()}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {value ? (
            <div
              className={cn(
                "relative rounded-lg overflow-hidden bg-muted",
                aspectRatioClass[aspectRatio],
              )}
            >
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50",
                "hover:border-primary/50 hover:bg-muted cursor-pointer transition-colors",
                "flex flex-col items-center justify-center gap-2",
                aspectRatioClass[aspectRatio],
              )}
            >
              <div className="p-3 rounded-full bg-muted">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Click to upload
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 5MB
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Choose File
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
