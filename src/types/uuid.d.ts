declare module 'uuid' {
  export function v4(): string;
  export function v1(): string;
  export function v5(name: string | ArrayLike<number>, namespace: string | ArrayLike<number>): string;
}
