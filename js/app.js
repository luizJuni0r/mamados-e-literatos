import { db } from "./supabase.js";

const nomeLivro = document.getElementById("nome-livro");
const nomeAutor = document.getElementById("nome-autor");
const observacoes = document.getElementById("observacoes");
const formRecomendacao = document.getElementById("form-formulario-recomendacao");
const iniciarLeitura = document.getElementById("iniciar-leitura");
const encerrarRecomendacoes = document.getElementById("encerrar-recomendacoes");

const secaoRecomendacao = document.querySelector(".form-recomendacao");
const secaoSorteio = document.querySelector(".resultado-sorteio");
const secaoLeitura = document.querySelector(".em-leitura");


formRecomendacao.addEventListener("submit", async function (event) {
    event.preventDefault();

    const resultado = await db
        .from("recomendacoes")
        .insert({
            livro: nomeLivro.value,
            autor: nomeAutor.value,
            observacoes: observacoes.value
        });

    console.log(resultado);
});

const { data } = await db.auth.getSession();

if (!data.session) {
    window.location.href = "login.html";
} else {
    document.body.classList.remove("autenticando");;
}




const { data: perfil, error: erroPerfil } = await db
    .from("perfis")
    .select("nickname, role")
    .single();

console.log(perfil);
console.log(erroPerfil);

if (perfil.role === "admin") {
    iniciarLeitura.style.display = "block";
    encerrarRecomendacoes.style.display = "block";
}







const { data: dominio, error: erroDominio } = await db
    .from("dominio")
    .select("estado_clube")
    .single();

console.log(dominio);
console.log(erroDominio);

if (dominio.estado_clube === "recomendacao") {
    secaoRecomendacao.style.display = "block";
} else if (dominio.estado_clube === "sorteio") {
    secaoSorteio.style.display = "block";
} else if (dominio.estado_clube === "leitura") {
    secaoLeitura.style.display = "block";
}

