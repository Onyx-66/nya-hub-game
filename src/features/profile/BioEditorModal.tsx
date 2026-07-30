import { useState, useEffect } from "react";
import Modal from "@/components/nya/Modal";
import NyaButton from "@/components/nya/NyaButton";
import { useAuthStore } from "@/store/authStore";

interface BioEditorModalProps {
  open: boolean;
  onClose: () => void;
}

const MAX_BIO = 80;

export default function BioEditorModal({ open, onClose }: BioEditorModalProps) {
  const { user, updateBio } = useAuthStore();
  const [text, setText] = useState("");

  useEffect(() => {
    if (open) setText(user?.bio ?? "");
  }, [open, user?.bio]);

  const handleSave = () => {
    updateBio(text);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Bio" size="md">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Tell other players about yourself! ({MAX_BIO} characters max)
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_BIO))}
          maxLength={MAX_BIO}
          rows={3}
          placeholder="I love puzzle games and cats..."
          className="w-full bg-muted/50 rounded-2xl px-4 py-3 text-foreground outline-none border border-border/50 focus:border-primary transition-colors resize-none"
          autoFocus
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {text.length}/{MAX_BIO}
          </span>
          <div className="flex gap-3">
            <NyaButton variant="secondary" onClick={onClose}>
              Cancel
            </NyaButton>
            <NyaButton onClick={handleSave}>Save</NyaButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}