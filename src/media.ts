export const getImageUrl = (content: object) => {
  const media = content as Record<string, unknown>;
  const url = String(media.url || "");
  if (url) {
    try {
      const parsed = new URL(url.startsWith("/r/") ? `https://reddit.com${url}` : url);
      if (parsed.pathname.match(/\.(jpeg|jpg|gif|png)$/)) {
        return parsed.href;
      }
    } catch (error) {
      console.error(error);
    }
  }

  const thumbnail = String(media.thumbnail || "");
  if (thumbnail) {
    try {
      return new URL(thumbnail).href;
    } catch {
      // Reddit uses non-URL thumbnail sentinels such as "self" and "default".
    }
  }

  return null;
};

export const hasRenderableMedia = (content: object) => {
  const embed = (content as Record<string, unknown>).secure_media_embed;
  const embedContent = embed && typeof embed === "object" ? (embed as Record<string, unknown>).content : null;
  return Boolean(getImageUrl(content) || embedContent);
};
