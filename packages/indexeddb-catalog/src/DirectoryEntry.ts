/**
 * ディレクトリエントリの型定義
 * uuid: そのエントリ自身を識別するユニークID
 * parent: 親エントリのuuid（ルートのときは空文字）
 * name: エントリ名
 */
export interface DirectoryEntry {
    uuid: string;
    parent: string;
    name: string;
    description: string;
    properties: {[key:string]:any};
}