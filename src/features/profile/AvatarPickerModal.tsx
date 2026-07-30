import { motion } from "framer-motion";
import CatAvatar from "@/components/nya/CatAvatar";
import Modal from "@/components/nya/Modal";
import { useAuthStore } from "@/store/authStore";

interface AvatarPickerModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AvatarPickerModal({ open, onClose }: AvatarPickerModalProps) {
  const { user, updateProfile } = useAuthStore();

  const handlePick = (avatarId: number) => {
    updateProfile({ avatar: String(avatarId), customAvatarUrl: null });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Pick Your Cat" size="md">
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 20 }, (_, i) => i + 1).map((id) => {
          const isSelected = user?.avatar === String(id);
          return (
            <motion.button
              key={id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handlePick(id)}
              className={`relative rounded-2xl p-1 transition-all ${
                isSelected
                  ? "bg-primary/20 ring-2 ring-primary"
                  : "hover:bg-muted/50"
              }`}
            >
              <CatAvatar avatarId={id} size={56} className="mx-auto" />
            </motion.button>
          );
        })}
      </div>
    </Modal>
  );
}