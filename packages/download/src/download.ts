import { smartFetch } from "./smartFetch";

export const download = async (
  url: string,
  callbacks: {
    onFailed?: (message: string) => void,
    onParseError?: (message: string) => void,
    text?: (content: string) => void,
    json?: (json: any) => void,
  }
): Promise<void> => {
  const data = await smartFetch(url);
  try{
    if(callbacks.json){
      try {
        callbacks.json(JSON.parse(data));
      } catch (err: any) {
        callbacks.onParseError && callbacks.onParseError(err.message);
      }
    }else if (callbacks.text) {
      callbacks.text(data);
    }
  }catch(err: any) {
    callbacks.onFailed && callbacks.onFailed(err.message);
  }
};

export default { download };