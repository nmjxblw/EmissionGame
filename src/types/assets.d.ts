declare module "*.csv?url" {
  const content: string;
  export default content;
}

declare module "*.csv" {
  const content: any;
  export default content;
}
