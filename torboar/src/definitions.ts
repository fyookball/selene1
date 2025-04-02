export interface TorboarPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;

  startTor(): Promise<{ message: string }>;
}

