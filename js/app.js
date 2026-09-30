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