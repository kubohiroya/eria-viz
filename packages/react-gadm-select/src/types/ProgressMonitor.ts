export type ProgressMonitor = (params: {
    /**
     * @param value 進捗状況を表す値
     */
    value: number;
    /**
     * @param valueMax 進捗状況を表す値の最大値、valueがこの値になったら終了
     */
    valueMax: number;
}) => Promise<void>;
