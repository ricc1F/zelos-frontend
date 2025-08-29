"use client";

export default function NotFoundPage() {
  return (
    <div className="notfound-page">
      <p className="zoom-area">
        <b>Ops!</b> Parece que você tentou acessar algo que não existe.
      </p>

      <section className="error-container">
        <span className="four"><span className="screen-reader-text">4</span></span>
        <span className="zero"><span className="screen-reader-text">0</span></span>
        <span className="four"><span className="screen-reader-text">4</span></span>
      </section>

      <div className="link-container">
        <a href="/" className="more-link">Voltar para a Home</a>
      </div>
    </div>
  );
}
