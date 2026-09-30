import { db } from "./supabase.js";

const nomeLivro = document.getElementById("nome-livro");
const nomeAutor = document.getElementById("nome-autor");
const observacoes = document.getElementById("observacoes");
const formRecomendacao = document.getElementById("form-formulario-recomendacao");

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