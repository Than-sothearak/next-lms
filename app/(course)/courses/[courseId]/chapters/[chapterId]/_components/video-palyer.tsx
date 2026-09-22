"use client";

import axios from "axios";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Maximize, Minimize, Pause, Play, Volume2, VolumeX } from "lucide-react";

import { cn } from "@/lib/utils";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import type { StudentTranslations } from "@/lib/student-translations";

interface VideoPlayerProps {

  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  isCompleted: boolean;
  title: string;
  url: string
  labels: StudentTranslations;
};

export const VideoPlayer = ({

  courseId,
  chapterId,
  nextChapterId,
  isLocked,
  completeOnEnd,
  isCompleted,
  title,
  url,
  labels,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const confetti = useConfettiStore();
  const maxWatchedTime = useRef(0);
  const hasAdvanced = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const storageKey = `course-video-progress:${courseId}:${chapterId}`;
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);
  const [hasCompletedLocally, setHasCompletedLocally] = useState(false);
  const canSeek = isCompleted || hasCompletedLocally;

  useEffect(() => {
    if (isCompleted) {
      sessionStorage.removeItem(storageKey);
      setHasLoadedProgress(true);
      return;
    }

    const savedTime = Number(sessionStorage.getItem(storageKey) || 0);
    if (Number.isFinite(savedTime) && savedTime > 0) {
      maxWatchedTime.current = savedTime;
    }
    setHasLoadedProgress(true);
  }, [isCompleted, storageKey]);

  const onTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    setCurrentTime(event.currentTarget.currentTime);
    if (!canSeek) {
      maxWatchedTime.current = Math.max(maxWatchedTime.current, event.currentTarget.currentTime);
      sessionStorage.setItem(storageKey, String(maxWatchedTime.current));
    }
  };

  const onSeeking = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    if (!canSeek && video.currentTime > maxWatchedTime.current + 0.5) {
      video.currentTime = maxWatchedTime.current;
    }
  };

  const onLoadedMetadata = (event: SyntheticEvent<HTMLVideoElement>) => {
    setIsReady(true);
    setDuration(event.currentTarget.duration || 0);
    if (!canSeek && event.currentTarget.currentTime > maxWatchedTime.current + 0.5) {
      event.currentTarget.currentTime = maxWatchedTime.current;
    }
  };

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) await video.play();
    else video.pause();
  };

  const revealControls = () => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    if (isPlaying) {
      controlsTimer.current = setTimeout(() => setShowControls(false), 2200);
    }
  };

  useEffect(() => () => {
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
  }, []);

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  useEffect(() => {
    const video = videoRef.current as (HTMLVideoElement & { webkitDisplayingFullscreen?: boolean }) | null;
    const fullscreenDocument = document as Document & {
      webkitFullscreenElement?: Element | null;
      mozFullScreenElement?: Element | null;
      msFullscreenElement?: Element | null;
    };
    const updateFullscreen = () => setIsFullscreen(
      fullscreenDocument.fullscreenElement === video ||
      fullscreenDocument.webkitFullscreenElement === video ||
      fullscreenDocument.mozFullScreenElement === video ||
      fullscreenDocument.msFullscreenElement === video ||
      video?.webkitDisplayingFullscreen === true
    );
    document.addEventListener("fullscreenchange", updateFullscreen);
    document.addEventListener("webkitfullscreenchange", updateFullscreen);
    document.addEventListener("mozfullscreenchange", updateFullscreen);
    document.addEventListener("MSFullscreenChange", updateFullscreen);
    video?.addEventListener("webkitbeginfullscreen", updateFullscreen);
    video?.addEventListener("webkitendfullscreen", updateFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", updateFullscreen);
      document.removeEventListener("webkitfullscreenchange", updateFullscreen);
      document.removeEventListener("mozfullscreenchange", updateFullscreen);
      document.removeEventListener("MSFullscreenChange", updateFullscreen);
      video?.removeEventListener("webkitbeginfullscreen", updateFullscreen);
      video?.removeEventListener("webkitendfullscreen", updateFullscreen);
    };
  }, []);

  const toggleFullscreen = async () => {
    const video = videoRef.current as (HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
      webkitExitFullscreen?: () => void;
      webkitDisplayingFullscreen?: boolean;
      webkitRequestFullscreen?: () => Promise<void> | void;
      msRequestFullscreen?: () => void;
    }) | null;
    if (!video) return;

    if (video.webkitEnterFullscreen && /iPhone|iPod|iPad/i.test(navigator.userAgent)) {
      if (video.webkitDisplayingFullscreen) video.webkitExitFullscreen?.();
      else video.webkitEnterFullscreen();
      return;
    }

    const fullscreenDocument = document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => Promise<void> | void;
      mozFullScreenElement?: Element | null;
      mozCancelFullScreen?: () => Promise<void> | void;
      msFullscreenElement?: Element | null;
      msExitFullscreen?: () => void;
    };
    const isFullscreen = document.fullscreenElement === video ||
      fullscreenDocument.webkitFullscreenElement === video ||
      fullscreenDocument.mozFullScreenElement === video ||
      fullscreenDocument.msFullscreenElement === video;

    if (isFullscreen) {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (fullscreenDocument.webkitExitFullscreen) await fullscreenDocument.webkitExitFullscreen();
      else if (fullscreenDocument.mozCancelFullScreen) await fullscreenDocument.mozCancelFullScreen();
      else fullscreenDocument.msExitFullscreen?.();
      return;
    }

    if (video.requestFullscreen) await video.requestFullscreen();
    else if (video.webkitRequestFullscreen) await video.webkitRequestFullscreen();
    else if (video.msRequestFullscreen) video.msRequestFullscreen();
  };

  const onEnd = async () => {
    if (hasAdvanced.current) return;
    hasAdvanced.current = true;
    try {
      if (completeOnEnd) {
        await axios.put(`/api/course/${courseId}/chapters/${chapterId}/progress`, {
          isCompleted: true,
        });
        sessionStorage.removeItem(storageKey);
        setHasCompletedLocally(true);

        if (!nextChapterId) {
          confetti.onOpen();
        }

        toast.success("Progress updated");
        router.refresh();

      }
    } catch {
      hasAdvanced.current = false;
      toast.error("Something went wrong");
    }
  }

  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-md"
      onMouseMove={revealControls}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        if (isPlaying) setShowControls(false);
      }}
      onTouchStart={revealControls}
    >
      {(!isReady || !hasLoadedProgress) && !isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary">
          <Lock className="h-8 w-8" />
          <p className="text-sm">{labels.lockedChapter}</p>
        </div>
      )}
      {!isLocked && hasLoadedProgress && (
         <video
         ref={videoRef}
         onLoadedMetadata={onLoadedMetadata}
         onCanPlay={() => setIsReady(true)}
         onEnded={onEnd}
         onTimeUpdate={onTimeUpdate}
         onSeeking={onSeeking}
         src={url}
         preload="metadata"
         onPlay={(event) => {
           setIsPlaying(true);
           if (!canSeek && event.currentTarget.currentTime > maxWatchedTime.current + 0.5) {
             event.currentTarget.currentTime = maxWatchedTime.current;
           }
         }}
         onPause={() => setIsPlaying(false)}
         onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
         onVolumeChange={(event) => {
           setIsMuted(event.currentTarget.muted);
         }}
         onClick={togglePlayback}
         className="h-full w-full bg-black object-contain"
       />
      )}
      {!isLocked && isReady && hasLoadedProgress && (
        <div className={`absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/90 to-transparent px-4 pb-3 pt-8 text-white transition-opacity duration-200 ${showControls || !isPlaying ? "opacity-100" : "pointer-events-none opacity-0"}`}>
          <button type="button" onClick={togglePlayback} className="rounded p-1 hover:bg-white/20" aria-label={isPlaying ? "Pause video" : "Play video"}>
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <span className="min-w-[72px] text-xs tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
          <input
            type="range"
            min={0}
            max={canSeek ? duration || 0 : Math.min(maxWatchedTime.current, duration || 0)}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            disabled={!duration || (!canSeek && maxWatchedTime.current <= 0)}
            onChange={(event) => {
              const video = videoRef.current;
              const targetTime = Number(event.target.value);
              if (video && (canSeek || targetTime <= maxWatchedTime.current)) {
                video.currentTime = targetTime;
              }
            }}
            aria-label="Video timeline"
            className="h-1 min-w-0 flex-1 accent-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          />
          <div className="group relative flex items-center">
            <button type="button" onClick={() => {
              const video = videoRef.current;
              if (video) video.muted = !video.muted;
            }} className="rounded p-1 hover:bg-white/20" aria-label={isMuted ? "Unmute video" : "Mute video"}>
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </div>
        </div>
      )}
      {!isLocked && isReady && hasLoadedProgress && (
        <button
          type="button"
          onClick={toggleFullscreen}
          className={`absolute right-3 top-3 rounded bg-black/55 p-2 text-white transition-opacity hover:bg-black/80 ${showControls || !isPlaying ? "opacity-100" : "pointer-events-none opacity-0"}`}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </button>
      )}
    </div>
  )
}
