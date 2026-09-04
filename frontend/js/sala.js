/*
====================================================
QR DA SALA
JavaScript da página de registro de problemas
====================================================
*/


/*
----------------------------------------------------
CONFIGURAÇÃO DA API
----------------------------------------------------
*/

/*
    Endereço onde nosso FastAPI está rodando.

    Enquanto estamos desenvolvendo localmente:

    http://127.0.0.1:8000

    Quando colocarmos na AWS, esse endereço será
    substituído pelo endereço da API em produção.
*/

const API_URL = "http://127.0.0.1:8000";


/*
----------------------------------------------------
IDENTIFICAÇÃO DA SALA
----------------------------------------------------
*/

/*
    Por enquanto estamos trabalhando com a Sala 204.

    Mais para frente o QR Code poderá abrir algo como:

    sala.html?sala=1

    e o JavaScript descobrirá automaticamente
    qual sala precisa carregar.
*/

const salaId = 1;


/*
----------------------------------------------------
ELEMENTOS HTML
----------------------------------------------------
*/

/*
    Encontramos os elementos da página através
    dos seus IDs/classes.
*/

const problemOptions =
    document.querySelectorAll(".problem-option");

const description =
    document.getElementById("description");

const submitButton =
    document.getElementById("submit-button");

const submitText =
    document.getElementById("submit-text");

const message =
    document.getElementById("message");


/*
----------------------------------------------------
VARIÁVEL DA CATEGORIA SELECIONADA
----------------------------------------------------
*/

/*
    Aqui vamos guardar qual problema
    o usuário selecionou.

    Inicialmente não existe nenhum.
*/

let selectedCategory = null;


/*
----------------------------------------------------
SELEÇÃO DO PROBLEMA
----------------------------------------------------
*/

/*
    Percorremos todos os botões:

    Projetor
    Internet
    Iluminação
    etc.

    Quando o usuário clicar em um deles,
    identificamos a categoria.
*/

problemOptions.forEach(function (option) {

    option.addEventListener("click", function () {

        /*
            Remove a seleção visual de todas
            as opções.
        */

        problemOptions.forEach(function (item) {

            item.classList.remove("selected");

        });


        /*
            Adiciona a classe "selected"
            somente no botão clicado.
        */

        option.classList.add("selected");


        /*
            Recupera o valor definido em:

            data-categoria="projetor"

            data-categoria="internet"

            etc.
        */

        selectedCategory =
            option.dataset.categoria;


        /*
            Limpa mensagens anteriores.
        */

        clearMessage();

    });

});


/*
----------------------------------------------------
ENVIO DO CHAMADO
----------------------------------------------------
*/

submitButton.addEventListener(
    "click",
    async function () {

        /*
            Antes de enviar precisamos verificar
            se o usuário selecionou uma categoria.
        */

        if (!selectedCategory) {

            showMessage(
                "Selecione o problema encontrado.",
                "error"
            );

            return;
        }


        /*
            Pegamos o texto digitado.
        */

        const descriptionValue =
            description.value.trim();


        /*
            Mostramos um pequeno feedback
            enquanto a API está sendo chamada.
        */

        submitButton.disabled = true;

        submitText.textContent =
            "Enviando...";


        try {

            /*
                Fazemos uma requisição POST
                para nossa API.

                Endpoint:

                POST /chamados/
            */

            const response = await fetch(
                `${API_URL}/chamados/`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    /*
                        Corpo enviado para o FastAPI.

                        O formato precisa ser igual
                        ao nosso ChamadoCreate.
                    */

                    body: JSON.stringify({

                        sala_id: salaId,

                        categoria: selectedCategory,

                        descricao: descriptionValue || null

                    })

                }
            );


            /*
                Se a API retornar erro,
                lançamos uma exceção.
            */

            if (!response.ok) {

                const errorData =
                    await response.json();

                throw new Error(
                    errorData.detail ||
                    "Não foi possível registrar o chamado."
                );

            }


            /*
                Transformamos a resposta
                da API em objeto JavaScript.
            */

            const data =
                await response.json();


            /*
                Mostramos mensagem de sucesso.
            */

            showMessage(
                `Problema registrado com sucesso! Chamado #${data.id}.`,
                "success"
            );


            /*
                Limpamos o formulário.
            */

            description.value = "";

            selectedCategory = null;


            /*
                Removemos a seleção visual.
            */

            problemOptions.forEach(
                function (item) {

                    item.classList.remove("selected");

                }
            );


        } catch (error) {

            /*
                Se acontecer algum problema
                na comunicação com a API,
                mostramos o erro.
            */

            console.error(
                "Erro ao registrar chamado:",
                error
            );


            showMessage(
                "Não foi possível registrar o problema. Verifique se a API está funcionando.",
                "error"
            );

        } finally {

            /*
                Independente de sucesso ou erro,
                devolvemos o botão ao estado normal.
            */

            submitButton.disabled = false;

            submitText.textContent =
                "Registrar problema";

        }

    }
);


/*
----------------------------------------------------
MOSTRAR MENSAGEM
----------------------------------------------------
*/

function showMessage(text, type) {

    /*
        Define o texto da mensagem.
    */

    message.textContent = text;


    /*
        Remove classes anteriores.
    */

    message.classList.remove(
        "success",
        "error"
    );


    /*
        Adiciona a classe correspondente.

        success → mensagem verde

        error → mensagem de erro
    */

    message.classList.add(type);

}


/*
----------------------------------------------------
LIMPAR MENSAGEM
----------------------------------------------------
*/

function clearMessage() {

    message.textContent = "";

    message.classList.remove(
        "success",
        "error"
    );

}