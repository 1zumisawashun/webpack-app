// NOTE:@typesディレクトリを作成してその下に配置することで自動的に読みに行ってくれる
declare module "*.svg" {
  const content: any;
  export default content;
}
