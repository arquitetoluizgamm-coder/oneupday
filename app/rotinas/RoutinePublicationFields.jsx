"use client";

import { useEffect, useRef, useState } from "react";
import ImageCropper from "../../components/ImageCropper";
import TrackPicker from "../home/TrackPicker";
import { createClient } from "../../lib/supabase/client";
import { duracaoDoVideo } from "../../lib/media";

const MAX_VIDEO = 60 * 1024 * 1024;

export default function RoutinePublicationFields({
  userId,
  value,
  onChange,
  labels,
}) {
  const [uploading, setUploading] = useState(false);
  const [rawFile, setRawFile] = useState(null);
  const [rawUrl, setRawUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const fileRef = useRef(null);

  useEffect(() => {
    if (value.media_kind !== "video" || !value.media_url) {
      setVideoDuration(0);
      return undefined;
    }
    const video = document.createElement("video");
    const onMetadata = () => setVideoDuration(Number(video.duration) || 0);
    video.preload = "metadata";
    video.addEventListener("loadedmetadata", onMetadata);
    video.src = value.media_url;
    return () => {
      video.removeEventListener("loadedmetadata", onMetadata);
      video.removeAttribute("src");
      video.load();
    };
  }, [value.media_kind, value.media_url]);

  useEffect(
    () => () => {
      if (rawUrl) URL.revokeObjectURL(rawUrl);
    },
    [rawUrl],
  );

  function patch(next) {
    onChange({ ...value, ...next });
  }

  async function store(fileOrBlob, extension) {
    const supabase = createClient();
    const safeExtension = String(extension || "jpg")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${safeExtension}`;
    const { error } = await supabase.storage
      .from("photos")
      .upload(path, fileOrBlob, { upsert: false });
    if (error) return null;
    return supabase.storage.from("photos").getPublicUrl(path).data.publicUrl;
  }

  async function onFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith("video/")) {
      if (file.size > MAX_VIDEO) {
        window.alert(labels.videoTooBig);
        event.target.value = "";
        return;
      }
      const duration = await duracaoDoVideo(file);
      setUploading(true);
      const uploaded = await store(file, file.name.split(".").pop() || "mp4");
      setUploading(false);
      if (!uploaded) {
        window.alert(labels.uploadError);
        return;
      }
      setVideoDuration(duration);
      setRawFile(null);
      patch({ media_url: uploaded, media_kind: "video" });
      return;
    }
    if (!file.type.startsWith("image/")) return;
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawFile(file);
    setRawUrl(URL.createObjectURL(file));
  }

  async function onCropDone(result) {
    const original = result === "original" || !result;
    const body = original ? rawFile : result;
    const extension = original
      ? rawFile?.name.split(".").pop() || "jpg"
      : "jpg";
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawUrl("");
    if (!body) return;
    setUploading(true);
    const uploaded = await store(body, extension);
    setUploading(false);
    if (!uploaded) {
      window.alert(labels.uploadError);
      return;
    }
    setVideoDuration(0);
    patch({ media_url: uploaded, media_kind: "photo" });
  }

  function onCropCancel() {
    if (rawUrl) URL.revokeObjectURL(rawUrl);
    setRawUrl("");
    if (!value.media_url) setRawFile(null);
  }

  function reframe() {
    if (!rawFile) return;
    setRawUrl(URL.createObjectURL(rawFile));
  }

  function removeMedia() {
    setRawFile(null);
    setVideoDuration(0);
    if (fileRef.current) fileRef.current.value = "";
    patch({ media_url: "", media_kind: "photo" });
  }

  if (rawUrl) {
    return (
      <ImageCropper
        src={rawUrl}
        labels={labels.crop}
        onDone={onCropDone}
        onCancel={onCropCancel}
      />
    );
  }

  return (
    <div className="routine-publication">
      <div>
        <span className="routine-field-title">{labels.mediaTitle}</span>
        <p className="routine-hint">{labels.mediaHint}</p>
      </div>

      {value.media_url ? (
        <div className="routine-media-preview">
          {value.media_kind === "video" ? (
            <video src={value.media_url} controls playsInline preload="metadata" />
          ) : (
            <img src={value.media_url} alt="" />
          )}
          <div className="routine-media-actions">
            {rawFile && value.media_kind === "photo" && (
              <button type="button" onClick={reframe}>
                {labels.reframe}
              </button>
            )}
            <button type="button" onClick={() => fileRef.current?.click()}>
              {labels.replace}
            </button>
            <button type="button" onClick={removeMedia}>
              {labels.remove}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="routine-media-pick"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          <span aria-hidden="true">▧</span>
          <b>{uploading ? labels.uploading : labels.addMedia}</b>
          <small>{labels.addMediaSub}</small>
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        hidden
        onChange={onFile}
      />

      <label>
        {labels.caption}
        <textarea
          rows={3}
          value={value.media_caption}
          onChange={(event) => patch({ media_caption: event.target.value })}
          placeholder={labels.captionPlaceholder}
        />
      </label>

      <div className="routine-music-field media-music-field">
        <span className="routine-field-title">{labels.musicTitle}</span>
        <div className="composer-toolbar">
          <div className="tools">
            <TrackPicker
              selected={value.track}
              onSelect={(track) => patch({ track })}
              videoDuration={videoDuration}
              labels={labels.music}
            />
          </div>
        </div>
      </div>

      <fieldset className="routine-visibility">
        <legend>{labels.visibilityTitle}</legend>
        <div className="routine-vis-options">
          {[
            ["public", labels.public, labels.publicSub],
            ["followers", labels.followers, labels.followersSub],
            ["private", labels.private, labels.privateSub],
          ].map(([id, title, description]) => (
            <button
              type="button"
              key={id}
              className={value.privacy === id ? "on" : ""}
              aria-pressed={value.privacy === id}
              onClick={() => patch({ privacy: id })}
            >
              <b>{title}</b>
              <small>{description}</small>
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
