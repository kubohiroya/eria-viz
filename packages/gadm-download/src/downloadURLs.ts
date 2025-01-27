/**
 * ダウンロード & GeoJSON解釈 & 保存
 *   - URLリストを受け取り
 *   - 失敗したURLがあればエラーをthrow or 戻り値で通知
 *   - 成功したらIndexedDBに保存
 */
import { smartFetch } from "./smartFetch";

export const downloadURLs = async (
  urlList: string[],
  contentType: string,
  onFailed: (url: string, message: string) => void,
  onParseError: (url: string, message: string) => void,
  onSuccess: (url: string, content: string) => void,
): Promise<void> => {

  for (const url of urlList) {
    try {
      const data = await smartFetch(url);
      try{
        // .replaceAll(/\\"/, '"')
        if(contentType === 'application/json'){
          const json = JSON.parse(data);
          onSuccess(url, json);
        }else if (contentType === 'text/html') {
          onSuccess(url, data);
        }
      } catch (err: any) {
        onFailed(url, err.message);
      }
    }catch(err: any) {
      onParseError(url, err.message);
    }
  }
};

export default { downloadURLs };