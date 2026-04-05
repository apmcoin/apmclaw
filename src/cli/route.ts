// 라우팅 단순화 — Commander가 직접 처리하도록 항상 false 반환
export async function tryRouteCli(_argv: string[]): Promise<boolean> {
  return false;
}
