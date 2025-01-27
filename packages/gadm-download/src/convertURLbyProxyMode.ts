export const convertURLbyProxyMode = (
  url: string,
  localProxyMode?: boolean,
  alloriginsMode?: boolean,
) => {
  return localProxyMode
    ? url.replace("https://", "/").replace("http://", "/")
    : alloriginsMode
      ? `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      : url;
};
