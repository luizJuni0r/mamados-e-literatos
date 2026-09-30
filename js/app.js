import { db } from "./supabase.js";


const nomeLivro = document.getElementById("nome-livro");
const nomeAutor = document.getElementById("nome-autor");
const observacoes = document.getElementById("observacoes");
const formRecomendacao = document.getElementById("form-formulario-recomendacao");
const iniciarLeitura = document.getElementById("iniciar-leitura");
const encerrarRecomendacoes = document.getElementById("encerrar-recomendacoes");
const mensagemRecomendacao = document.getElementById("recomendacao-enviada");
const sorteioLivro = document.getElementById("sorteio-livro");
const sorteioAutor = document.getElementById("sorteio-autor");
const sorteioRecomendado = document.getElementById("sorteio-recomendado");
const sorteioObservacao = document.getElementById("sorteio-observacao");
const leituraLivro = document.getElementById("leitura-livro");
const leituraAutor = document.getElementById("leitura-autor");
const leituraRecomendado = document.getElementById("leitura-recomendado");
const concluirLeitura = document.getElementById("concluir-leitura");
const droparLeitura = document.getElementById("dropar-leitura");
const historicoLista = document.getElementById("historico-lista");
const tituloLeitura = document.getElementById("titulo-leitura");
const abrirRecomendacoes = document.getElementById("abrir-recomendacoes");
const sair = document.getElementById("sair");

const secaoRecomendacao = document.querySelector(".form-recomendacao");
const secaoSorteio = document.querySelector(".resultado-sorteio");
const secaoLeitura = document.querySelector(".em-leitura");

//--------------------obtendo dados


const { data } = await db.auth.getSession(); //redireciona

if (!data.session) {
    window.location.href = "login.html";
    throw new Error("Sessão não encontrada.");
}

document.body.classList.remove("autenticando");


const { data: perfil, error: erroPerfil } = await db //obtem o usuário,a role dele e ja mostra o que recisa mostrar
    .from("perfis")
    .select("nickname, role")
    .eq("id", data.session.user.id)
    .single();

    if (erroPerfil || !perfil) {
        console.log(erroPerfil);
        throw new Error("Não foi possível carregar o perfil.");
    }

//regras de visibilidade para o admin
if (perfil.role === "admin") {
    iniciarLeitura.style.display = "block";
    encerrarRecomendacoes.style.display = "block";
}   

const { data: dominio, error: erroDominio } = await db // obtem o estado do clube com as regras de dominio
    .from("dominio")
    .select("id, leitura_atual, estado_clube")
    .single();

    if (erroDominio || !dominio) {
        console.log(erroDominio);
        throw new Error("Não foi possível carregar o domínio.");
    }

if (dominio.estado_clube === "recomendacao") { //Caso estado recomendação
    const { data: minhaRecomendacao, error: erroMinhaRecomendacao } = await db
        .from("recomendacoes")
        .select("id")
        .eq("recomendado_por", data.session.user.id)
        .maybeSingle();

    const { data: ultimaLeitura, error: erroUltimaLeitura } = await db
        .from("historico_leitura")
        .select("recomendado_por")
        .not("finalizado_em", "is", null)
        .order("finalizado_em", { ascending: false })
        .limit(1)
        .maybeSingle();

    const fuiUltimoRecomendador =
    ultimaLeitura?.recomendado_por === data.session.user.id;

    if (minhaRecomendacao) {
        mensagemRecomendacao.textContent = "Sua recomendação já foi enviada.";
        mensagemRecomendacao.style.display = "block";

    } else if (fuiUltimoRecomendador) {
        mensagemRecomendacao.textContent =
            "Você recomendou a última leitura e não participa desta rodada.";
        mensagemRecomendacao.style.display = "block";

    } else {
        formRecomendacao.style.display = "flex";
    }
    secaoRecomendacao.style.display = "block";

} else if (dominio.estado_clube === "sorteio") { //caso estado sorteio
    const { data: recomendacaoSorteada, error: erroSorteio } = await db
        .from("recomendacoes")
        .select(`
            livro,
            autor,
            observacoes,
            recomendado_por,
            perfis (
                nickname
            )
        `)
        .eq("sorteado", true)
        .single();


    // depois vamos preencher os elementos aqui

    if (!erroSorteio && recomendacaoSorteada) {
        sorteioLivro.textContent = recomendacaoSorteada.livro;
        sorteioAutor.textContent = recomendacaoSorteada.autor;

        sorteioRecomendado.textContent =
            `Recomendado por ${recomendacaoSorteada.perfis?.nickname ?? "Usuário"}`;

        sorteioObservacao.textContent =
            recomendacaoSorteada.observacoes || "Sem observações.";

        secaoSorteio.style.display = "block";
    }

} else if (dominio.estado_clube === "leitura") {

    const { data: leituraAtual, error: erroLeituraAtual } = await db
        .from("historico_leitura")
        .select(`
            livro,
            autor,
            perfis (
                nickname
            )
        `)
        .eq("id", dominio.leitura_atual)
        .single();

    if (!erroLeituraAtual && leituraAtual) {
        leituraLivro.textContent = leituraAtual.livro;
        leituraAutor.textContent = leituraAtual.autor;

        leituraRecomendado.textContent =
            `Recomendado por ${leituraAtual.perfis?.nickname ?? "Usuário"}`;

        secaoLeitura.style.display = "block";
        if (perfil.role === "admin") {
            concluirLeitura.style.display = "block";
            droparLeitura.style.display = "block";
        }
    }

} else if (dominio.estado_clube === "encerrado") {

    const { data: ultimaLeitura, error: erroUltimaLeitura } = await db
        .from("historico_leitura")
        .select(`
            livro,
            autor,
            status,
            perfis (
                nickname
            )
        `)
        .eq("id", dominio.leitura_atual)
        .single();

    if (!erroUltimaLeitura && ultimaLeitura) {
        leituraLivro.textContent = ultimaLeitura.livro;
        leituraAutor.textContent = ultimaLeitura.autor;
        leituraRecomendado.textContent =
            `Recomendado por ${ultimaLeitura.perfis?.nickname ?? "Usuário"}`;

        tituloLeitura.textContent =
            ultimaLeitura.status === "dropado"
                ? "LEITURA DROPADA"
                : "LEITURA CONCLUÍDA";

        secaoLeitura.style.display = "block";

        if (perfil.role === "admin") {
            abrirRecomendacoes.style.display = "block";
        }
    }
}

// BUSCA DOS DADOS HISTÓRICOS
const { data: historico, error: erroHistorico } = await db
    .from("historico_leitura")
    .select(`
        livro,
        autor,
        status,
        finalizado_em,
        perfis (
            nickname
        )
    `)
    .not("finalizado_em", "is", null)
    .order("finalizado_em", { ascending: false });

if (erroHistorico) {
    console.log(erroHistorico);
} else {

    // Montando os históricos obtidos
    historico.forEach(function (leitura) {
        const linha = document.createElement("tr");

        const livro = document.createElement("td");
        const autor = document.createElement("td");
        const recomendado = document.createElement("td");
        const status = document.createElement("td");

        livro.textContent = leitura.livro;
        autor.textContent = leitura.autor;
        recomendado.textContent =
            leitura.perfis?.nickname ?? "Usuário";

        if (leitura.status === "concluido") {
            status.textContent = "Concluído";
        } else if (leitura.status === "dropado") {
            status.textContent = "Dropado";
        }

        linha.appendChild(livro);
        linha.appendChild(autor);
        linha.appendChild(recomendado);
        linha.appendChild(status);

        historicoLista.appendChild(linha);
    });
}


//------------Eventos

formRecomendacao.addEventListener("submit", async function (event) {
    event.preventDefault();

    const botaoEnviar =
        formRecomendacao.querySelector('button[type="submit"]');

    botaoEnviar.disabled = true;

    const resultado = await db
        .from("recomendacoes")
        .insert({
            livro: nomeLivro.value,
            autor: nomeAutor.value,
            observacoes: observacoes.value,
            recomendado_por: data.session.user.id
        });

    if (resultado.error) {
        console.log(resultado.error);
        botaoEnviar.disabled = false;
        return;
    }

    formRecomendacao.reset();
    formRecomendacao.style.display = "none";
    mensagemRecomendacao.style.display = "block";
});


encerrarRecomendacoes.addEventListener("click", async function () {
    encerrarRecomendacoes.disabled = true;

    const { data: recomendacoes, error } = await db
        .from("recomendacoes")
        .select("*");

    if (error) {
        console.log(error);
        encerrarRecomendacoes.disabled = false;
        return;
    }

    if (recomendacoes.length === 0) {
        console.log("Não há recomendações para sortear.");
        encerrarRecomendacoes.disabled = false;
        return;
    }

    const indiceSorteado = Math.floor(
        Math.random() * recomendacoes.length
    );

    const recomendacaoSorteada = recomendacoes[indiceSorteado];

    const resultadoSorteio = await db
        .from("recomendacoes")
        .update({ sorteado: true })
        .eq("id", recomendacaoSorteada.id);

    if (resultadoSorteio.error) {
        console.log(resultadoSorteio.error);
        encerrarRecomendacoes.disabled = false;
        return;
    }

    const resultadoDominio = await db
        .from("dominio")
        .update({
            estado_clube: "sorteio",
            atualizado: new Date().toISOString()
        })
        .eq("id", dominio.id);

    if (resultadoDominio.error) {
        console.log(resultadoDominio.error);
        encerrarRecomendacoes.disabled = false;
        return;
    }

    window.location.reload();
});

iniciarLeitura.addEventListener("click", async function () {
    iniciarLeitura.disabled = true;

    const { data: sorteada, error: erroSorteada } = await db
        .from("recomendacoes")
        .select("livro, autor, observacoes, recomendado_por")
        .eq("sorteado", true)
        .single();

    if (erroSorteada) {
        console.log(erroSorteada);
        iniciarLeitura.disabled = false;
        return;
    }

    const { data: novaLeitura, error: erroNovaLeitura } = await db
        .from("historico_leitura")
        .insert({
            livro: sorteada.livro,
            autor: sorteada.autor,
            observacoes: sorteada.observacoes,
            recomendado_por: sorteada.recomendado_por,
            status: "leitura",
            iniciado_em: new Date().toISOString()
        })
        .select("id")
        .single();

    if (erroNovaLeitura) {
        console.log(erroNovaLeitura);
        iniciarLeitura.disabled = false;
        return;
    }

    const resultadoDominio = await db
        .from("dominio")
        .update({
            leitura_atual: novaLeitura.id,
            estado_clube: "leitura",
            atualizado: new Date().toISOString()
        })
        .eq("id", dominio.id);

    if (resultadoDominio.error) {
        console.log(resultadoDominio.error);
        iniciarLeitura.disabled = false;
        return;
    }

    window.location.reload();
});

concluirLeitura.addEventListener("click", async function () {
    concluirLeitura.disabled = true;

    const resultado = await db
        .from("historico_leitura")
        .update({
            status: "concluido",
            finalizado_em: new Date().toISOString()
        })
        .eq("id", dominio.leitura_atual);

    if (resultado.error) {
        console.log(resultado.error);
        concluirLeitura.disabled = false;
        return;
    }

    const resultadoDominio = await db
        .from("dominio")
        .update({
            estado_clube: "encerrado",
            atualizado: new Date().toISOString()
        })
        .eq("id", dominio.id);

    if (resultadoDominio.error) {
        console.log(resultadoDominio.error);
        concluirLeitura.disabled = false;
        return;
    }

    window.location.reload();
});


droparLeitura.addEventListener("click", async function () {
    droparLeitura.disabled = true;

    const resultado = await db
        .from("historico_leitura")
        .update({
            status: "dropado",
            finalizado_em: new Date().toISOString()
        })
        .eq("id", dominio.leitura_atual);

    if (resultado.error) {
        console.log(resultado.error);
        droparLeitura.disabled = false;
        return;
    }

    const resultadoDominio = await db
        .from("dominio")
        .update({
            estado_clube: "encerrado",
            atualizado: new Date().toISOString()
        })
        .eq("id", dominio.id);

    if (resultadoDominio.error) {
        console.log(resultadoDominio.error);
        droparLeitura.disabled = false;
        return;
    }

    window.location.reload();
});


abrirRecomendacoes.addEventListener("click", async function () {
    abrirRecomendacoes.disabled = true;

    const resultadoDelete = await db
        .from("recomendacoes")
        .delete()
        .neq("id", 0);

    if (resultadoDelete.error) {
        console.log(resultadoDelete.error);
        abrirRecomendacoes.disabled = false;
        return;
    }

    const resultadoDominio = await db
        .from("dominio")
        .update({
            estado_clube: "recomendacao",
            leitura_atual: null,
            atualizado: new Date().toISOString()
        })
        .eq("id", dominio.id);

    if (resultadoDominio.error) {
        console.log(resultadoDominio.error);
        abrirRecomendacoes.disabled = false;
        return;
    }

    window.location.reload();
});

sair.addEventListener("click", async function () {
    const { error } = await db.auth.signOut();

    if (error) {
        console.log(error);
        return;
    }

    window.location.href = "login.html";
});