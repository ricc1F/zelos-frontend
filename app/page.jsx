"use client";

import Link from "next/link";

// Ícones
const IconFacebook = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z" />
  </svg>
);
const IconInstagram = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.012-3.584.07-4.85c.148-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.644-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z" />
  </svg>
);
const IconLinkedIn = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-4.47 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.59-11.018-3.714v-2.155z" />
  </svg>
);
const IconYoutube = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
  </svg>
);

export default function WelcomePage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-5">
      {/* Imagem lateral */}
      <div
        className="hidden lg:block lg:col-span-3 relative bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://fdr.com.br/wp-content/uploads/2021/03/SENAI-se-une-a-prefeitura-de-Maua-para-oferecer-cursos-tecnicos-gratuitos.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
      </div>

      {/* Conteúdo */}
      <div className="lg:col-span-2 bg-white text-gray-800 flex flex-col justify-center p-8 sm:p-16">
        <div className="w-full max-w-sm mx-auto flex flex-col gap-6 min-h-[500px]">
          <header className="mb-auto">
            <div className="flex items-center gap-3">
              {/* Logo SENAI */}
              <img
                src="./senai-logo.png" // ajuste o caminho da sua imagem
                alt="Logo SENAI"
                className="h-10 w-auto"
              />

              {/* Barrinha vertical */}
              <span className="w-px h-9 bg-gray-300"></span>

              {/* Texto ZELOS */}
              <span className="text-3xl font-bold text-gray-800 tracking-tight">
                ZELOS
              </span>
            </div>
            <p className="text-gray-600 mt-4">
              Portal de chamados da Escola SENAI Armando de Arruda Pereira.
            </p>
          </header>

          <main className="my-10">
            <div className="flex flex-col items-center gap-4">
              <Link
                href="/login/admin"
                className="w-full text-center py-3 px-6 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-transform transform hover:scale-105 shadow-md"
              >
                Administrador
              </Link>
              <Link
                href="/login/tecnico"
                className="w-full text-center py-3 px-6 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-md"
              >
                Técnico
              </Link>
              <Link
                href="/login/user"
                className="w-full text-center py-3 px-6 rounded-lg font-semibold text-white bg-gray-700 hover:bg-gray-800 transition-transform transform hover:scale-105 shadow-md"
              >
                Usuário
              </Link>
            </div>
          </main>

          <footer className="mt-auto pt-8 border-t border-gray-200 text-center text-xs text-gray-600">
            <div className="flex justify-center gap-6 mb-4">
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-800 transition-colors"
              >
                <IconFacebook />
              </a>
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-800 transition-colors"
              >
                <IconInstagram />
              </a>
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-800 transition-colors"
              >
                <IconLinkedIn />
              </a>
              <a
                href="https://youtu.be/xvFZjo5PgG0"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-800 transition-colors"
              >
                <IconYoutube />
              </a>
            </div>
            <p>© {currentYear} Zelos - Todos os direitos reservados.</p>
            <p>SENAI Armando de Arruda Pereira</p>
          </footer>
        </div>
      </div>
    </div>
  );
}