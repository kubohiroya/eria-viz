import JSZip from "jszip";
import { convertURLbyProxyMode } from "./convertURLbyProxyMode";

async function extractUint8ArrayFromBase64ZipString(
  base64Zip: string,
): Promise<Uint8Array> {
  // base64エンコードされたZIPデータをデコード
  const zipData = atob(base64Zip.split("base64,")[1]);
  const zip = new JSZip();
  // ZIPアーカイブを読み込む
  const loadedZip = await zip.loadAsync(zipData, { base64: true });
  // ZIPアーカイブ内のファイル名を取得
  const fileNames = Object.keys(loadedZip.files);
  if (fileNames.length !== 1) {
    throw new Error("ZIPアーカイブは1つのファイルのみを含む必要があります");
  }
  // ZIPアーカイブ内のファイル内容を取得
  return await loadedZip.file(fileNames[0])!.async("uint8array");
}

async function extractUint8ArrayFromZipArrayBuffer(
  arrayBuffer: ArrayBuffer,
): Promise<Uint8Array> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(arrayBuffer);
  // ZIPアーカイブ内のファイル名を取得
  const fileNames = Object.keys(loadedZip.files);
  if (fileNames.length !== 1) {
    throw new Error("ZIPアーカイブは1つのファイルのみを含む必要があります");
  }
  // ZIPアーカイブ内のファイル内容を取得
  return await loadedZip.file(fileNames[0])!.async("uint8array");
}

export async function readAllChunks(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): Promise<ArrayBuffer> {
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    chunks.push(value);
    totalLength += value.length;
  }

  const fullArray = new Uint8Array(totalLength);
  let position = 0;
  for (const chunk of chunks) {
    fullArray.set(chunk, position);
    position += chunk.length;
  }

  return fullArray.buffer;
}

export const smartFetch = async (url: string): Promise<string> => {
  const localProxyMode = window?.location?.hostname === "localhost";
  const alloriginsMode = true;
  const actualUrl = convertURLbyProxyMode(url, localProxyMode, alloriginsMode);

  const res = await fetch(actualUrl).catch((error) => {
    throw error;
  });
  const zipMode = res.headers.get("content-type") === "application/zip";
  if (alloriginsMode) {
    const contents = res.body!.getReader();
    const arrayBufferSrc = await readAllChunks(contents);
    const array = zipMode
      ? await extractUint8ArrayFromZipArrayBuffer(arrayBufferSrc)
      : new Uint8Array(arrayBufferSrc);
    return new TextDecoder().decode(array);
  } else {
    const contents = (await res.json()).contents;
    if (zipMode) {
      const uint8Array = await extractUint8ArrayFromBase64ZipString(contents);
      return new TextDecoder().decode(uint8Array);
    } else {
      return contents;
    }
  }
};
