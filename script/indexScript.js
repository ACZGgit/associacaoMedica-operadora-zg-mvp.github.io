//************** verifica login *********************//
if(!(sessionStorage.getItem("logado") === "yes"))
    window.location.replace("./login.html");

//************** URLs ********************************//
//urlLocalhost = "http://localhost:8080"
//const urlBackend = 'https://convenioassociacaomedica.rj.r.appspot.com';
const urlBackend = 'https://convenioassociacaomedica.onrender.com';


//***************** formulário *************************//

const formulario = document.getElementById("formularioFiltro");
const tipoDefiltro = document.getElementById("filtro");
const dataInicial = document.getElementById("dataInicial");
const dataFinal = document.getElementById("dataFinal");
const buttonListar = document.getElementById("buttonListar");
const buttonListarTodos = document.getElementById("buttonListarTodos");
const mensagemErro = document.getElementById("msg-erro");
const tableDemonstrativos = document.getElementsByTagName("table");
const containerTableDemonstrativos = document.getElementById("tabela-demonstrativos");
const buttonSair = document.getElementById("Sair");

buttonSair.addEventListener("click",onLogout);
buttonListar.addEventListener("click", listarDemonstrativosComFiltro);
buttonListarTodos.addEventListener("click",listarTodosOsDemonstrativos);


async function listarTodosOsDemonstrativos(){

    try {
        let queryParamsListarTodos = `?listarTodos=true?&tokenDeAcesso=${sessionStorage.getItem("tokenDeAcesso")}`;
        let uriListarTodosDemonstrativos = `${urlBackend}/demonstrativos${queryParamsListarTodos}`;


        let headers = {};

        let listaDemonstrativosResponse;
        await fetch(uriListarTodosDemonstrativos, {
            method: 'GET',
            headers: headers
        }).then(res => res.json())
            .then(json => {
                //console.log(json);
                listaDemonstrativosResponse = json;
            })
            .catch(function (res) {
                console.log(res)
            });

        if(listaDemonstrativosResponse.status === 403)
            throw listaDemonstrativosResponse;

        if (!listaDemonstrativosResponse.existemDemonstrativos) {
            mensagemDeErro(true, listaDemonstrativosResponse.mensagem);
        } else {
            mensagemDeErro(false);
            containerTableDemonstrativos.style.display = "block";
            listaDemonstrativosNaTable(listaDemonstrativosResponse.demonstrativos);
        }
    }catch (error){
        if(error.status === 403)
            acessoNegadoHandle();
    }
}



async function listarDemonstrativosComFiltro(){
    try {
            if(!dataFinal.valueAsDate &&  !dataFinal.valueAsDate)
                throw {mensagem: "informe o intervalo de datas"};


            let dataInicialN = addDays(dataInicial.valueAsDate,1);
            let dataFinalN = addDays(dataFinal.valueAsDate,1);

            if(validaIntervaloDeDatas(dataInicialN, dataFinalN))
                throw {mensagem: "Data Inválida: data inicio deve ser menor que data fim"};


            let queryParamsFiltro = `?dataInicial=${data_To_yyyy_mm_dd(dataInicialN)}`+
                                     `&dataFinal=${data_To_yyyy_mm_dd(dataFinalN)}`+
                                     `&tokenDeAcesso=${sessionStorage.getItem("tokenDeAcesso")}`;

            let uriListarDemonstrativosFiltrados = `${urlBackend}/demonstrativos${queryParamsFiltro}`;

            let headers = {};

            let listaDemonstrativosFiltradosResponse;
            await fetch(uriListarDemonstrativosFiltrados, {
                method: 'GET',
                headers: headers
            }).then(res => res.json())
                .then(json => {
                    //console.log(json);
                    listaDemonstrativosFiltradosResponse = json;
                })
                .catch(function (res) {
                    console.log(res)
                });

            if(!listaDemonstrativosFiltradosResponse)
                throw {mensagem: "Status:500, servidor não respondeu, por favor tente mais tarde ou entre em contato com o time de suporte"};

        if(listaDemonstrativosFiltradosResponse.status === 403)
            throw listaDemonstrativosFiltradosResponse;

            if(listaDemonstrativosFiltradosResponse.status === 400)
                throw listaDemonstrativosFiltradosResponse;


            if (!listaDemonstrativosFiltradosResponse.existemDemonstrativos) {
                containerTableDemonstrativos.style.display = "none";
                throw listaDemonstrativosFiltradosResponse;
            }

            mensagemDeErro(false);
            containerTableDemonstrativos.style.display = "block";
            listaDemonstrativosNaTable(listaDemonstrativosFiltradosResponse.demonstrativos);


    }catch(error){
       if(error.status === 403)
            acessoNegadoHandle();
       mensagemDeErro(true, error.mensagem);
       console.log(error);
    }
}

function listaDemonstrativosNaTable(listaDemonstrativos){
    let linha =
        "<tr class=\"cinza\">" +
            "<th>Data do Vencimento</th>" +
            "<th>Lote(s)</th>" +
            "<th>Referência</th>" +
            "<th>Cŕedito</th>" +
            "<th>Débito</th>" +
            "<th>Líquido</th>" +
            "<th>Data de Pagamento</th>" +
            "<th>Download</th>" +
        "</tr>";

    listaDemonstrativos.forEach(x =>{
        linha += (`
            <tr>
                <td>${data_To_dd_mm_yyyy(x.dataDeVencimento)}</td>
                <td>${x.lote}</td>
                <td>${x.referencia}</td>
                <td>${x.credito}</td>
                <td>${x.debito}</td>
                <td>${x.liquido}</td>
                <td>${data_To_dd_mm_yyyy(x.dataDePagamento)}</td>
                <td class='download'>
                    <a href="${urlBackend}${x.url}&tokenDeAcesso=${sessionStorage.getItem("tokenDeAcesso")}" download>
                        <img alt="Download" src='images/icons8-down-button-64.png'>
                    </a>
                </td>
            </tr>
       `);
    });
    tableDemonstrativos[0].innerHTML = linha;
}




//******************* Validações ****************************************//

function validaIntervaloDeDatas(dataInicial, dataFinal){

    let dataInicio = new Date(dataInicial);
    let dataFim = new Date(dataFinal);

    return (dataInicio > dataFim);
}

function onLogout(){
    sessionStorage.setItem("logado","no");
    sessionStorage.setItem("tokenDeAcesso", "");
    window.location.href = "./login.js";
}

function acessoNegadoHandle(){
    sessionStorage.setItem("logado", "no");
    sessionStorage.setItem("tokenDeAcesso", "");
    window.location.replace("./login.html");
}

//****************** mensagens de erro ***********************************//

function mensagemDeErro(ativacao, mensagem){
    if(ativacao) {
        mensagemErro.innerHTML = `<p style='color: red;margin-top: 10px;'>${mensagem}</p>`;
        mensagemErro.style.display = "block";
        console.log(mensagem);
    }else{
        mensagemErro.style.display = "none";
    }
}



//************************** padronização de dados **************************//
function data_To_dd_mm_yyyy(dataString){
    let data = new Date(dataString);

    let anoMesDia =  getYearMonthDayWithZero(data);

    return `${anoMesDia[2]}/${anoMesDia[1]}/${anoMesDia[0]}`;
}

function data_To_yyyy_mm_dd(dataString){
    let data = new Date(dataString);

    let anoMesDia =  getYearMonthDayWithZero(data);

    return `${anoMesDia[0]}-${anoMesDia[1]}-${anoMesDia[2]}`;
}

function getYearMonthDayWithZero(date){
    let year = date.getFullYear();

    let month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    let day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return [year,month,day]
}

function addDays(date,days){
    date.setDate(date.getDate() + days);
    return date;
}

