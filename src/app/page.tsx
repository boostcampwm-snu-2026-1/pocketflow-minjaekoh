export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="w-full max-w-3xl rounded-lg border bg-card p-8">
        <p className="text-sm text-muted-foreground">Pocketflow</p>
        <h1 className="mt-3 text-3xl font-bold">현금흐름 예측 대시보드</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
          프로젝트 초기 환경 세팅이 완료되었습니다. 다음 이슈에서 공통
          레이아웃과 라우팅을 연결합니다.
        </p>
      </section>
    </main>
  );
}
