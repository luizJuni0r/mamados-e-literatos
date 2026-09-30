import { db } from "./supabase.js";

const formLogin = document.getElementById("form-login");
const email = document.getElementById("email");
const senha = document.getElementById("senha");

formLogin.addEventListener("submit", async function (event) {
    event.preventDefault();

    const resultado = await db.auth.signInWithPassword({
        email: email.value,
        password: senha.value
    });

    console.log(resultado);
});