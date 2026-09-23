"use client";

import axios from "axios";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Headphones,
  Loader2,
  Lock,
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";

import { useConfettiStore } from "@/hooks/use-confetti-store";
import { cn } from "@/lib/utils";
import type { StudentTranslations } from "@/lib/student-translations";

interface VideoPlayerProps {
  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  isCompleted: boolean;
  title: string;
  url: string;
  imageUrl?: string;
  labels: StudentTranslations;
}

export const VideoPlayer = ({
  courseId,
  chapterId,
  nextChapterId,
  isLocked,
  completeOnEnd,
  isCompleted,
  title,
  url,
  imageUrl,
  labels,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAppFullscreen, setIsAppFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);
  const [hasCompletedLocally, setHasCompletedLocally] = useState(false);

  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxWatchedTime = useRef(0);
  const hasAdvanced = useRef(false);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);

  const router = useRouter();
  const confetti = useConfettiStore();

  const isAudio = /\.(mp3|wav|ogg|m4a|aac|flac)(?:[?#]|$)/i.test(url);
  const storageKey = `course-video-progress:${courseId}:${chapterId}`;
  const canSeekAnywhere = isCompleted || hasCompletedLocally;

  useEffect(() => {
    maxWatchedTime.current = 0;
    hasAdvanced.current = false;
    setHasLoadedProgress(false);
    setHasCompletedLocally(false);

    if (isCompleted) {
      sessionStorage.removeItem(storageKey);
    } else {
      const savedTime = Number(sessionStorage.getItem(storageKey) || 0);

      if (Number.isFinite(savedTime) && savedTime > 0) {
        maxWatchedTime.current = savedTime;
      }
    }

    setHasLoadedProgress(true);
  }, [chapterId, courseId, isCompleted, storageKey]);

  const onTimeUpdate = (event: SyntheticEvent<HTMLMediaElement>) => {
    const media = event.currentTarget;

    if (
      !canSeekAnywhere &&
      media.currentTime > maxWatchedTime.current + 0.5
    ) {
      media.currentTime = maxWatchedTime.current;
      return;
    }

    setCurrentTime(media.currentTime);

    // A seek must never count as watched time.
    if (!canSeekAnywhere && !media.seeking && !media.paused) {
      maxWatchedTime.current = Math.max(
        maxWatchedTime.current,
        media.currentTime
      );

      sessionStorage.setItem(storageKey, String(maxWatchedTime.current));
    }
  };

  const onSeeking = (event: SyntheticEvent<HTMLMediaElement>) => {
    const media = event.currentTarget;

    if (
      !canSeekAnywhere &&
      media.currentTime > maxWatchedTime.current + 0.5
    ) {
      media.currentTime = maxWatchedTime.current;
    }
  };

  const onLoadedMetadata = (event: SyntheticEvent<HTMLMediaElement>) => {
    const media = event.currentTarget;

    setIsReady(true);
    setDuration(Number.isFinite(media.duration) ? media.duration : 0);

    if (
      !canSeekAnywhere &&
      media.currentTime > maxWatchedTime.current + 0.5
    ) {
      media.currentTime = maxWatchedTime.current;
    }
  };

  const onPlay = (event: SyntheticEvent<HTMLMediaElement>) => {
    const media = event.currentTarget;

    if (
      !canSeekAnywhere &&
      media.currentTime > maxWatchedTime.current + 0.5
    ) {
      media.currentTime = maxWatchedTime.current;
    }

    setIsPlaying(true);
  };

  const togglePlayback = async () => {
    const media = mediaRef.current;
    if (!media) return;

    try {
      if (media.paused) {
        await media.play();
      } else {
        media.pause();
      }
    } catch {
      toast.error("Could not play this lesson");
    }
  };

  const revealControls = () => {
    setShowControls(true);

    if (controlsTimer.current) {
      clearTimeout(controlsTimer.current);
    }

    if (isPlaying) {
      controlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 2200);
    }
  };

  useEffect(() => {
    return () => {
      if (controlsTimer.current) {
        clearTimeout(controlsTimer.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");

    return `${mins}:${secs}`;
  };

  useEffect(() => {
    const video = mediaRef.current as
      | (HTMLVideoElement & { webkitDisplayingFullscreen?: boolean })
      | null;

    const fullscreenDocument = document as Document & {
      webkitFullscreenElement?: Element | null;
      mozFullScreenElement?: Element | null;
      msFullscreenElement?: Element | null;
    };

    const updateFullscreen = () => {
      setIsFullscreen(
        fullscreenDocument.fullscreenElement === video ||
          fullscreenDocument.webkitFullscreenElement === video ||
          fullscreenDocument.mozFullScreenElement === video ||
          fullscreenDocument.msFullscreenElement === video ||
          video?.webkitDisplayingFullscreen === true
      );
    };

    document.addEventListener("fullscreenchange", updateFullscreen);
    document.addEventListener("webkitfullscreenchange", updateFullscreen);
    document.addEventListener("mozfullscreenchange", updateFullscreen);
    document.addEventListener("MSFullscreenChange", updateFullscreen);
    video?.addEventListener("webkitbeginfullscreen", updateFullscreen);
    video?.addEventListener("webkitendfullscreen", updateFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", updateFullscreen);
      document.removeEventListener(
        "webkitfullscreenchange",
        updateFullscreen
      );
      document.removeEventListener(
        "mozfullscreenchange",
        updateFullscreen
      );
      document.removeEventListener(
        "MSFullscreenChange",
        updateFullscreen
      );
      video?.removeEventListener(
        "webkitbeginfullscreen",
        updateFullscreen
      );
      video?.removeEventListener(
        "webkitendfullscreen",
        updateFullscreen
      );
    };
  }, [hasLoadedProgress, isAudio, isLocked]);

  const toggleFullscreen = async () => {
    const video = mediaRef.current as
      | (HTMLVideoElement & {
          webkitEnterFullscreen?: () => void;
          webkitExitFullscreen?: () => void;
          webkitDisplayingFullscreen?: boolean;
          webkitRequestFullscreen?: () => Promise<void> | void;
          msRequestFullscreen?: () => void;
        })
      | null;

    if (!video) return;

    if (isAppFullscreen) {
      setIsAppFullscreen(false);
      return;
    }

    if (
      video.webkitEnterFullscreen &&
      /iPhone|iPod|iPad/i.test(navigator.userAgent)
    ) {
      if (video.webkitDisplayingFullscreen) {
        video.webkitExitFullscreen?.();
      } else {
        video.webkitEnterFullscreen();
      }
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

    const currentlyFullscreen =
      document.fullscreenElement === video ||
      fullscreenDocument.webkitFullscreenElement === video ||
      fullscreenDocument.mozFullScreenElement === video ||
      fullscreenDocument.msFullscreenElement === video;

    if (currentlyFullscreen) {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (fullscreenDocument.webkitExitFullscreen) {
        await fullscreenDocument.webkitExitFullscreen();
      } else if (fullscreenDocument.mozCancelFullScreen) {
        await fullscreenDocument.mozCancelFullScreen();
      } else {
        fullscreenDocument.msExitFullscreen?.();
      }
      return;
    }

    try {
      if (video.requestFullscreen) await video.requestFullscreen();
      else if (video.webkitRequestFullscreen) await video.webkitRequestFullscreen();
      else if (video.msRequestFullscreen) video.msRequestFullscreen();
      else setIsAppFullscreen(true);
    } catch {
      setIsAppFullscreen(true);
    }
  };

  const onEnd = async () => {
    if (
      hasAdvanced.current ||
      isCompleted ||
      hasCompletedLocally ||
      !completeOnEnd
    ) {
      return;
    }

    hasAdvanced.current = true;

    try {
      await axios.put(
        `/api/course/${courseId}/chapters/${chapterId}/progress`,
        { isCompleted: true }
      );

      sessionStorage.removeItem(storageKey);
      setHasCompletedLocally(true);

      if (!nextChapterId) {
        confetti.onOpen();
      }

      toast.success("Progress updated");
      router.refresh();
    } catch {
      hasAdvanced.current = false;
      toast.error("Something went wrong");
    }
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-black",
        isFullscreen || isAppFullscreen
          ? "fixed inset-0 z-[100] h-screen rounded-none"
          : "aspect-video rounded-md"
      )}
      onMouseMove={revealControls}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        if (isPlaying) {
          if (controlsTimer.current) clearTimeout(controlsTimer.current);
          controlsTimer.current = setTimeout(() => setShowControls(false), 900);
        }
      }}
      onTouchStart={revealControls}
    >
      {(!isReady || !hasLoadedProgress) && !isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      )}

      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-y-2 bg-slate-800 text-secondary">
          <Lock className="h-8 w-8" />
          <p className="text-sm">{labels.lockedChapter}</p>
        </div>
      )}

      {!isLocked &&
        hasLoadedProgress &&
        (isAudio ? (
          <div className="flex h-full w-full overflow-hidden bg-slate-950 text-white">
            {imageUrl ? (
              <>
                <div className="relative flex min-w-0 flex-1 items-center justify-center">
                  <img
                    src={imageUrl}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="flex w-[38%] min-w-[150px] flex-col items-center justify-center gap-3 border-l border-white/20 bg-slate-900/90 p-4 text-center sm:w-[32%] sm:min-w-[220px] sm:gap-4 sm:p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/20 sm:h-14 sm:w-14">
                    <Headphones className="h-5 w-5 text-blue-200 sm:h-7 sm:w-7" />
                  </div>
                  <h2 className="line-clamp-3 break-words text-sm font-semibold sm:text-base">
                    {title || "Audio lesson"}
                  </h2>
                </div>
              </>
            ) : (
              <div className="flex w-full flex-col items-center justify-center gap-4 p-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/20">
                  <Headphones className="h-10 w-10 text-blue-200" />
                </div>
                <h2 className="max-w-[80%] break-words text-lg font-semibold">
                  {title || "Audio lesson"}
                </h2>
              </div>
            )}

            <audio
              ref={(element) => {
                mediaRef.current = element;
              }}
              src={url}
              preload="metadata"
              className="sr-only"
              onLoadedMetadata={onLoadedMetadata}
              onCanPlay={() => setIsReady(true)}
              onEnded={onEnd}
              onTimeUpdate={onTimeUpdate}
              onSeeking={onSeeking}
              onPlay={onPlay}
              onPause={() => setIsPlaying(false)}
              onDurationChange={(event) => {
                setDuration(event.currentTarget.duration || 0);
              }}
              onVolumeChange={(event) => {
                setIsMuted(event.currentTarget.muted);
              }}
            />
          </div>
        ) : (
          <video
            ref={(element) => {
              mediaRef.current = element;
            }}
            src={url}
            poster={imageUrl}
            preload="metadata"
            className="h-full w-full bg-black object-contain"
            onLoadedMetadata={onLoadedMetadata}
            onCanPlay={() => setIsReady(true)}
            onEnded={onEnd}
            onTimeUpdate={onTimeUpdate}
            onSeeking={onSeeking}
            onPlay={onPlay}
            onPause={() => setIsPlaying(false)}
            onDurationChange={(event) => {
              setDuration(event.currentTarget.duration || 0);
            }}
            onVolumeChange={(event) => {
              setIsMuted(event.currentTarget.muted);
            }}
            onClick={togglePlayback}
          />
        ))}

      {!isLocked && isReady && hasLoadedProgress && (
        <div
          className={`absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/90 to-transparent px-4 pb-3 pt-8 text-white transition-opacity duration-200 ${
            showControls || !isPlaying
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={togglePlayback}
            className="rounded p-1 hover:bg-white/20"
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>

          <span className="min-w-[72px] text-xs tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            disabled={!duration}
            onChange={(event) => {
              const media = mediaRef.current;
              const targetTime = Number(event.target.value);

              if (
                media &&
                (canSeekAnywhere ||
                  targetTime <= maxWatchedTime.current)
              ) {
                media.currentTime = targetTime;
              }
            }}
            aria-label="Lesson timeline"
            style={{
              background: `linear-gradient(to right, rgb(59 130 246) ${duration ? ((canSeekAnywhere ? currentTime : maxWatchedTime.current) / duration) * 100 : 0}%, rgb(148 163 184 / 0.55) ${duration ? ((canSeekAnywhere ? currentTime : maxWatchedTime.current) / duration) * 100 : 0}%)`,
            }}
            className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full accent-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          />

          <button
            type="button"
            onClick={() => {
              const media = mediaRef.current;
              if (media) media.muted = !media.muted;
            }}
            className="rounded p-1 hover:bg-white/20"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
        </div>
      )}

      {!isLocked && isReady && hasLoadedProgress && !isAudio && (
        <button
          type="button"
          onClick={toggleFullscreen}
          className={`absolute right-3 top-3 rounded bg-black/55 p-2 text-white transition-opacity hover:bg-black/80 ${
            showControls || !isPlaying
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }`}
          aria-label={isFullscreen || isAppFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen || isAppFullscreen ? (
            <Minimize className="h-5 w-5" />
          ) : (
            <Maximize className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  );
};
