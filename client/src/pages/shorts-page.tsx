import { useParams, useLocation } from "wouter";
import { ShortsPlayer } from "@/components/shorts-player";

export default function ShortsPage() {
  const { bookId } = useParams<{ bookId?: string }>();
  const [, navigate] = useLocation();

  const handleClose = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/");
    }
  };

  return (
    <ShortsPlayer
      bookId={bookId}
      onClose={handleClose}
    />
  );
}
