import Dexie from "dexie";
import { DirectoryEntry } from "./DirectoryEntry";

export class DatabaseCatalog {
    /**
     * Dexie インスタンス（カタログDB用）
     */
    private static dexie: Dexie | null = null;
    private static ROOT_ID = "(ROOT)";
    /**
     * ディレクトリテーブル
     */
    private static directory: Dexie.Table<DirectoryEntry, string> | null = null;

    /**
     * カタログ上でこのエントリが持つ情報
     */
    public readonly uuid: string;
    public parent: string;
    public name: string;
    public description: string = "";
    public properties: { [key: string]: any } = {};

    /**
     * コンストラクタは直接呼ばず、
     *  - ルート（parent=ROOT_ID）を初期化する場合は `DatabaseCatalog.initialize(...)`
     *  - 子エントリのインスタンスを生成する場合は専用メソッド(`create`, `get` など)経由
     * とする想定のため、private としておく。
     */
    private constructor(
        entry: DirectoryEntry
        /* uuid: string, parent: string, name: string, description: string = "", properties: { [key: string]: any } = {}*/
    ) {
        this.uuid = entry.uuid;
        this.parent = entry.parent;
        this.name = entry.name;
        this.description = entry.description;
        this.properties = entry.properties
    }

    /**
     * 初期化用のスタティックメソッド。
     * ここで「階層情報を保持するカタログ用のDB」を開き、
     * 親エントリが ROOT_ID で、name が `databaseName` のルート要素を取得または作成する。
     *
     * @param catalogDatabaseName カタログ用DBの名前（かつルート要素の name としても使う）
     * @param description 作成するエントリの説明
     * @param overwrite 既存DBを上書き初期化する場合は true
     * @returns ルートの DatabaseCatalog インスタンス
     */
    public static async initialize(
        catalogDatabaseName: string,
        description: string,
        overwrite: boolean = false
    ): Promise<DatabaseCatalog> {

        if(catalogDatabaseName === ""){
            throw new Error("databaseName is empty: "+catalogDatabaseName);
        }

        // 既存の Dexie インスタンスがある場合は再初期化するかどうかの判断が必要
        // ここでは単純に上書き指定があれば削除して再初期化、なければ流用とする
        if (DatabaseCatalog.dexie && DatabaseCatalog.dexie.name !== catalogDatabaseName) {
            // 別名DBがすでに開かれているなら、一旦閉じて null にする
            DatabaseCatalog.dexie.close();
            DatabaseCatalog.dexie = null;
            DatabaseCatalog.directory = null;
        }

        // overwrite が真なら既存DBを削除
        if (overwrite) {
            await Dexie.delete(catalogDatabaseName);
        }

        // カタログDB用の Dexie インスタンスを生成・初期化
        if (!DatabaseCatalog.dexie) {
            const dexie = new Dexie(catalogDatabaseName);
            // "directory":"$$uuid, parent, name" という指定を、
            // Dexie では下記のような stores 定義に置き換えられる想定：
            //   $$uuid => uuidを主キー（ユニーク）として登録
            //   parent, name => 索引
            dexie.version(1).stores({
                directory: "&uuid,parent,name,[parent+name]",
            });

            await dexie.open();
            DatabaseCatalog.dexie = dexie;
            DatabaseCatalog.directory = dexie.table<DirectoryEntry, string>("directory");
        }

        // ルート要素を取得 or 作成 (parent=ROOT_ID かつ name=databaseName)
        const dirTable = DatabaseCatalog.directory!;
        let rootEntry = await dirTable.get({ parent: DatabaseCatalog.ROOT_ID, name: catalogDatabaseName });
        if (!rootEntry) {
            // まだ存在しないなら作成
            const now = Date.now();
            rootEntry = {
                uuid: crypto.randomUUID(),
                parent: DatabaseCatalog.ROOT_ID,
                name: catalogDatabaseName,
                description: description,
                properties: {},
                createdAt: now,
                updatedAt: now
            };
            await dirTable.add(rootEntry);
        }

        return new DatabaseCatalog(rootEntry);
    }

    /**
     * ルートのエントリ（parent=ROOT_ID かつ name=<引数>）を返すメソッド
     */
    public static async getRoot(name: string): Promise<DatabaseCatalog> {
        if (!DatabaseCatalog.directory) {
            throw new Error("DatabaseCatalog is not initialized.");
        }
        // parent=DatabaseCatalog.ROOT_ID かつ name=指定で検索
        const rootEntry = await DatabaseCatalog.directory.get({ parent: DatabaseCatalog.ROOT_ID, name });
        if (!rootEntry) {
            throw new Error(`Root not found with name "${name}".`);
        }

        return new DatabaseCatalog(rootEntry);
    }

    /**
     * このエントリがルートかどうか (parent === ROOT_ID)
     */
    public isRoot(): boolean {
        return this.parent === DatabaseCatalog.ROOT_ID;
    }

    /**
     * このエントリの直下にある子エントリの name 一覧を返す
     */
    public async listNames(): Promise<string[]> {
        if (!DatabaseCatalog.directory) {
            throw new Error("DatabaseCatalog is not initialized.");
        }
        const children = await DatabaseCatalog.directory.where("parent").equals(this.uuid).toArray();
        return children.map((c) => c.name);
    }

    /**
     * このエントリの直下にある子エントリの DatabaseCatalog インスタンス一覧を返す
     */
    public async listChildren(): Promise<DatabaseCatalog[]> {
        if (!DatabaseCatalog.directory) {
            throw new Error("DatabaseCatalog is not initialized.");
        }
        const children = await DatabaseCatalog.directory.where("parent").equals(this.uuid).toArray();
        return children.map(
            (entry) => new DatabaseCatalog(entry)
        );
    }

    /**
     * このエントリの直下にある子エントリを name を指定して取得
     * @param name 子エントリ名
     * @returns 該当する DatabaseCatalog
     */
    public async get(name: string): Promise<DatabaseCatalog|null> {
        if (!DatabaseCatalog.directory) {
            throw new Error("DatabaseCatalog is not initialized.");
        }
        const child = await DatabaseCatalog.directory.get({ parent: this.uuid, name });
        if (!child) {
            return null;
        }
        return new DatabaseCatalog(child);
    }

    /**
     * このエントリの直下にある子エントリを name を指定して削除する。
     * 同時に、実体DB ("${name}-${uuid}") も削除する。
     * @param name 削除対象の子エントリ名
     * @returns 削除できたら true、見つからなかったら false
     */
    public async remove(name: string): Promise<boolean> {
        if (!DatabaseCatalog.directory) {
            throw new Error("DatabaseCatalog is not initialized.");
        }
        const child = await DatabaseCatalog.directory.get({ parent: this.uuid, name });
        if (!child) {
            return false;
        }

        await DatabaseCatalog.removeRecursively(child.uuid);
        return true;
    }


    /**
     * 【再帰的に削除】指定した uuid のエントリと、その子孫をすべて削除。
     */
    private static async removeRecursively(uuid: string): Promise<void> {
        if (!DatabaseCatalog.directory) {
            throw new Error("DatabaseCatalog is not initialized.");
        }

        // 自エントリを取得
        const entry = await DatabaseCatalog.directory.get(uuid);
        if (!entry) {
            return;
        }

        // 子エントリを取得
        const children = await DatabaseCatalog.directory
            .where("parent")
            .equals(uuid)
            .toArray();

        // 子を再帰削除
        for (const child of children) {
            await DatabaseCatalog.removeRecursively(child.uuid);
        }

        // 物理DB(=uuid)を削除
        await Dexie.delete(entry.uuid);
        // カタログから自身を削除
        await DatabaseCatalog.directory.delete(uuid);
    }

    /**
     * このエントリの直下にある子エントリを oldName から newName にリネームする。
     * 実際には IndexedDB の DB名を変える手段はないため、
     * "新DB作成 → データ移行(省略中) → 旧DB削除" という流れを想定している。
     * @param oldName 変更前の子エントリ名
     * @param newName 変更後の子エントリ名
     * @returns リネーム後の子エントリを示す DatabaseCatalog
     */
    public async rename(oldName: string, newName: string): Promise<DatabaseCatalog> {
        if (!DatabaseCatalog.directory) {
            throw new Error("DatabaseCatalog is not initialized.");
        }
        const child = await DatabaseCatalog.directory.get({ parent: this.uuid, name: oldName });
        if (!child) {
            throw new Error(`Child not found: ${oldName}`);
        }

        // 物理DB名(uuid) は変更せず、カタログ上の name だけを変更
        child.name = newName;
        await DatabaseCatalog.directory.put(child);

        return new DatabaseCatalog(child);
    }

    /**
     * このエントリの直下にある子エントリを新規作成する。
     * 同時に実体DB ("${name}-${uuid}") も新規作成する。
     * @param name 作成するエントリの名前
     * @param description 作成するエントリの説明
     * @returns 作成された子エントリを示す DatabaseCatalog
     */
    public async create(name: string, description: string = "", properties: {[key:string]:any} = {}): Promise<DatabaseCatalog> {
        if (!DatabaseCatalog.directory) {
            throw new Error("DatabaseCatalog is not initialized.");
        }

        // 同名の子エントリが既にある場合はエラーにする
        const exists = await DatabaseCatalog.directory.get({ parent: this.uuid, name });
        if (exists) {
            throw new Error(`Child already exists: ${name}`);
        }

        // 新規エントリを作成
        const newUuid = crypto.randomUUID();
        const now = Date.now();
        const newEntry: DirectoryEntry = {
            uuid: newUuid,
            parent: this.uuid,
            name,
            description,
            properties,
            createdAt: now,
            updatedAt: now
        };
        await DatabaseCatalog.directory.add(newEntry);

        // 実体DB を作成（とりあえず open → close）
        return new DatabaseCatalog(newEntry);
    }

    public getIndexedDBName(): string {
        return `${this.name}-${this.uuid}`;
    }

    public async update({description, properties}:{description?: string, properties?: {[key:string]:any}}): Promise<void> {
        if (!DatabaseCatalog.directory) {
            throw new Error("DatabaseCatalog is not initialized.");
        }
        const entry = await DatabaseCatalog.directory.get(this.uuid);
        if (!entry) {
            throw new Error(`Entry not found: ${this.uuid}`);
        }
        description && (entry.description = description);
        properties && (entry.properties = properties);
        entry.updatedAt = Date.now();
        await DatabaseCatalog.directory.put(entry);
    }

    /**
     * パス（["ルート名", "子1", "子2", ...]）で指定されたエントリを取得する。
     * ルート名＝(parent=ROOT_ID で name=ルート名) を起点に下へ辿る。
     * @param path ルートを含む名前配列
     * @returns 見つかった DatabaseCatalog
     */
    public static async getByPath(path: string[]): Promise<DatabaseCatalog> {
        if (!DatabaseCatalog.directory) {
            throw new Error("DatabaseCatalog is not initialized.");
        }
        if (path.length === 0) {
            throw new Error("Empty path is not valid.");
        }

        // まずルートを特定
        let current = await DatabaseCatalog.directory.get({ parent: DatabaseCatalog.ROOT_ID, name: path[0] });

        // 下層へ順番にたどる
        for (let i = 1; i < path.length; i++) {
            if (!current) {
                throw new Error(`Root not found: ${path[0]}`);
            }
            const child = await DatabaseCatalog.directory.get({ parent: current!.uuid, name: path[i] });
            if (!child) {
                throw new Error(`Not found: ${path[i]}`);
            }
            current = child;
        }
        if(current){
            return new DatabaseCatalog(current);
        }else{
            throw new Error(`node not found: ${path}`);
        }
    }

    /**
     * パス指定でエントリを削除する。
     * 実際に削除するのは最終要素だけで、その親要素の直下から除去する形。
     * @param path ["ルート名", "子1", "最終削除対象"]
     * @returns 成功時は true、見つからない等なら false
     */
    public static async removeByPath(path: string[]): Promise<boolean> {
        if (path.length === 0) return false;
        const targetName = path[path.length - 1];
        // 親ディレクトリ（最終要素を除くパス）を取得
        const parentCatalog = await DatabaseCatalog.getByPath(path.slice(0, -1));
        return await parentCatalog.remove(targetName);
    }

    /**
     * パス指定でリネームを行う。
     * 実際にリネームするのは最終要素のみ。
     * @param path ["ルート名", "子1", "リネーム対象"]
     * @param newName 新しい名前
     * @returns リネーム後の DatabaseCatalog
     */
    public static async renameByPath(path: string[], newName: string): Promise<DatabaseCatalog> {
        if (path.length === 0) {
            throw new Error("Invalid path.");
        }
        const targetName = path[path.length - 1];
        const parentCatalog = await DatabaseCatalog.getByPath(path.slice(0, -1));
        return await parentCatalog.rename(targetName, newName);
    }

    /**
     * パス指定のディレクトリに対して、新しい子エントリを作る
     * @param parentPath ["ルート名", "子1", ...] (新エントリをぶら下げたい親)
     * @param newName 作成するエントリの名前
     * @param description 作成するエントリの説明
     * @returns 作成された子エントリの DatabaseCatalog
     */
    public static async createByPath(parentPath: string[], newName: string, description: string, properties: {[key:string]:any}): Promise<DatabaseCatalog> {
        // 親を取得
        const parentCatalog = await DatabaseCatalog.getByPath(parentPath);
        return await parentCatalog.create(newName, description, properties);
    }
}
