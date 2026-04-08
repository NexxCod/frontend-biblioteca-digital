import React from "react";

function AuthSplitLayout({
  badge,
  title,
  description,
  children,
  heroTitle,
  heroDescription,
  heroPoints = [],
  hideHero = false,
}) {
  if (hideHero) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <section className="auth-panel glass-panel w-full max-w-[460px] rounded-[28px]">
          <span className="eyebrow">{badge}</span>
          <h2 className="mt-4 text-[1.85rem] text-[var(--text-main)]">{title}</h2>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              {description}
            </p>
          ) : null}
          <div className="mt-6">{children}</div>
        </section>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <span className="eyebrow bg-white/14 text-white">{badge}</span>
        <h1 className="mt-5 max-w-xl text-3xl leading-tight sm:text-4xl">
          {heroTitle}
        </h1>
        {heroDescription ? (
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/78 sm:text-[15px]">
            {heroDescription}
          </p>
        ) : null}

        {heroPoints.length > 0 && (
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {heroPoints.map((point) => (
              <article
                key={point.title}
                className="rounded-[20px] border border-white/14 bg-white/10 p-3.5 backdrop-blur-sm"
              >
                <p className="text-sm font-semibold">{point.title}</p>
                <p className="mt-1.5 text-sm text-white/72">{point.description}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="auth-panel glass-panel">
        <span className="eyebrow">{badge}</span>
        <h2 className="mt-4 text-[1.85rem] text-[var(--text-main)]">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
            {description}
          </p>
        ) : null}
        <div className="mt-6">{children}</div>
      </section>
    </div>
  );
}

export default AuthSplitLayout;
