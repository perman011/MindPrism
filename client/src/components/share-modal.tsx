import { useState, useCallback } from "react";
import { X, Copy, Check, ExternalLink } from "lucide-react";
import { SiX, SiLinkedin, SiWhatsapp } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  bookTitle: string;
  bookAuthor: string;
  bookId: string;
}

export function ShareModal({ open, onClose, bookTitle, bookAuthor, bookId }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://mindprism.io/book/${bookId}`;
  const shareText = `I'm learning "${bookTitle}" by ${bookAuthor} on @MindPrism`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const shareOptions = [
    {
      label: "Twitter / X",
      icon: SiX,
      color: "hover:bg-white/10",
      onClick: () => window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        "_blank", "noopener,noreferrer"
      ),
    },
    {
      label: "LinkedIn",
      icon: SiLinkedin,
      color: "hover:bg-[#0077b5]/10",
      onClick: () => window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        "_blank", "noopener,noreferrer"
      ),
    },
    {
      label: "WhatsApp",
      icon: SiWhatsapp,
      color: "hover:bg-[#25d366]/10",
      onClick: () => window.open(
        `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
        "_blank", "noopener,noreferrer"
      ),
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-sm mx-4 mb-4 sm:mb-0 rounded-2xl bg-[#FFFFFF] border border-primary/20 overflow-hidden"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            data-testid="share-modal"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Share This Book</h3>
              <button
                onClick={onClose}
                className="w-11 h-11 rounded-full bg-muted flex items-center justify-center"
                data-testid="button-close-share"
                aria-label="Close share dialog"
              >
                <X className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              </button>
            </div>

            <div className="p-4 space-y-2">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-primary/10 transition-colors"
                data-testid="button-copy-link"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-primary" />}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{copied ? "Link Copied!" : "Copy Link"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{shareUrl}</p>
                </div>
              </button>

              {shareOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={opt.onClick}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 ${opt.color} transition-colors`}
                  data-testid={`button-share-${opt.label.toLowerCase().replace(/\s+\/\s+/g, "-")}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <opt.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-semibold text-foreground">Share on {opt.label}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useShareBook(book: { id: string; title: string; author: string } | null | undefined) {
  const [showShareModal, setShowShareModal] = useState(false);

  const handleShare = useCallback(async () => {
    if (!book) return;

    const shareUrl = `https://mindprism.io/book/${book.id}`;
    const shareText = `I'm learning "${book.title}" by ${book.author} on MindPrism`;

    if (navigator.share) {
      try {
        await navigator.share({ title: book.title, text: shareText, url: shareUrl });
        return;
      } catch {
        // user cancelled or share failed, fall through to modal
      }
    }
    setShowShareModal(true);
  }, [book]);

  return { showShareModal, setShowShareModal, handleShare };
}
