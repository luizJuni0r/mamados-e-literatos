import { db } from "./supabase.js";

const formLogin = document.getElementById("form-login");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const mensagemLogin = document.getElementById("mensagem-login");

formLogin.addEventListener("submit", async function (event) {
    //console.log("submit aconteceu");

    event.preventDefault();

    const resultado = await db.auth.signInWithPassword({
        email: email.value,
        password: senha.value
    });

    if (resultado.error) {
    	mensagemLogin.textContent = "Email ou senha incorretos.";
	};

    console.log(resultado);
});
