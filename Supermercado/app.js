const porta = 8080;
const pasta = "/telas"; // pasta que armazena as telas

// Telas
const t_estoque = __dirname+pasta+"/Produtos.html";
const home = __dirname+pasta+"/index.html";
const menu = __dirname+pasta+"/pag2.html";
const telavenda = __dirname+pasta+"/vendas.html"
const telalotes = __dirname+pasta+"/lotes.html";
const altera = __dirname+pasta+"/alterar.html";
const telalotes2 = __dirname+pasta+"/lotes2.html";
const t_estoque2 = __dirname+pasta+"/Produtos2.html";

// Modulos proprios
var Estoque = require("./classes/estoqueDAO.js");
var Produto = require("./classes/produtoDAO.js");

// Modulos externos
var express = require("express");
var bodyParser = require("body-parser");
const path = require('path');
const cheerio = require("cheerio");
const fs = require("fs");
const { Client } = require('pg');
const { quantidades } = require("./classes/estoqueDAO.js");

var estoque = Estoque;
var sessao = {valida: false, nome: null, cargo: null, cod_acesso: 0}; // Guarda a sessao atual

// Inicializacao do app
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(porta);
app.use(express.static(__dirname + pasta + "/"));
console.log("Servidor iniciado na porta "+porta);

// Acesso ao banco de dados
const client = new Client({
  user: 'fldbrpgkoivefs',
  host: 'ec2-44-205-177-160.compute-1.amazonaws.com',
  database: 'd8jmkgc2ggho64',
  password: '5eb75af6128338127549bc316d22ac9068e5884d18faa59bde22cb46336da1f3',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
})
client.connect(function(err) {
  if (err) throw err;
  console.log("Conectado ao banco de dados");
});


// Funções de manipulação do banco
var temp = [];

function pr(a){console.log('Operação no banco feita com sucesso');}

function selec(val, func){
  // Funcao para aguardar as respostas das consultas e processar os dados
    temp = val;
    if(temp != []){
      func(temp);
    }
};

function consulta(comando, f){
  // Envia o comando ao banco e aplica a funcao f aos dados retornados
  client.query(comando, (err, res) => {
    if (err) throw err;
    selec(res, f);
  });
};

function iniciar_estoque(data){
    // Inicialzia o estoque com base no Banco de dados
    var est = Estoque;
    var lista_itens = [];
    var categorias = [];
    var quantidades = {};
    for(let tdata of data.rows){
        var temp = new Produto();
        temp.set_id(tdata.numproduto);
        temp.set_nome(tdata.nome);
        temp.set_categoria(tdata.categoria);
        if(!(tdata.categoria in categorias)){
          categorias.push(tdata.categoria);
        }
        quantidades[tdata.numproduto] = tdata.estoque;
        temp.set_preco(tdata.valor);
        lista_itens.push(temp);
    }
    est.iniciar(lista_itens, categorias, quantidades);
    estoque = est;
}

consulta('select * from public.produto;', iniciar_estoque);

app.get("/", function(req, res){
    // Retorna a tela principal quando requisita o localhost
    res.sendFile(home);
});

app.get("/estoque", function(req, res) {
    // Retorna a tela do estoque
    if(!sessao.valida){
      res.redirect("/");
      return 0;
    }
    consulta('select * from public.produto;', iniciar_estoque);
    function chunck(item){
      // Gera um elemento html em texto com base num objeto produto
      return               `
      <tr>
        <th class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-1">${item.id}</th>
        <th class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-2">${item.nome}</th>
        <th class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-3">
          <form action="http://localhost:8080/estoque/qtd" method="post">  
            <input type="hidden" name="id" value="${item.id}">
            <input name="nova_qtd" type="number" placeholder="${estoque.quantidades[item.id]}" id="qtd_${item.id}" 
            value="${estoque.quantidades[item.id]}" onchange="this.form.submit()" min="0" required>
          </form>
        </th>
        <th class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-4">R$:${item.preco}</th>
        <th class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-5">${item.categoria}</th>
        <th>
        </th>
          <th class="acao">
          <form action="http://localhost:8080/estoque/editar/${item.id}" method="post">
            <button type="submit">Editar</button></form>
          </th>
          <th class="acao">
          <form action="http://localhost:8080/estoque/deletar/${item.id}" method="get">
            <button type="submit">Excluir</button></form>
          </th>
        </tr>
      `;
    }
    fs.readFile(t_estoque, "utf8", function(err, data) {
      // Funcao para abrir o index.html e o editar antes de enviar ao cliente
      if (err) throw err;
  
      var $ = cheerio.load(data);
      var texto = `                
      <tr style="height: 27px;">
      <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-1">Numero</td>
      <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-2">Nome</td>
      <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-3">Quantidade</td>
      <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-4">Valor</td>
      <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-5">Categoria</td>
      </tr>`;

      for(var i=0; i<estoque.max+1; i++){
          // Criacao ordenada por id de cada elemento do estoque como um item no html
          var item = estoque.get_item(i, null, null);
          if(item != null){  
              texto += chunck(item);
      }
    }
      
      // Edita o html aberto e o retorna ao cliente
      $(".table-produtos").html(texto);
      res.send($.html());
    });
  });

app.post("/estoque/busca", function(req, res){
    // Retorna a tela do estoque
    if(!sessao.valida){
      res.redirect("/");
      return 0;
    }
    consulta('select * from public.produto;', iniciar_estoque);
    var nome = req.body['busca_nome'];
    if(nome == ""){nome = null;}
    var categoria = req.body['busca_categoria'];
    if(categoria == ""){categoria = null;}
    var id = parseInt(req.body['busca_id']);
    function chunck(item){
      // Gera um elemento html em texto com base num objeto produto
      return               `
      <tr>
        <th>${item.id}</th>
        <th>${item.nome}</th>
        <th>
          <form action="http://localhost:8080/estoque/qtd" method="post">  
            <input type="hidden" name="id" value="${item.id}">
            <input name="nova_qtd" type="number" placeholder="${estoque.quantidades[item.id]}" id="qtd_${item.id}" 
            value="${estoque.quantidades[item.id]}" onchange="this.form.submit()" min="0" required>
          </form>
        </th>
        <th>R$:${item.preco}</th>
        <th>${item.categoria}</th>
        <th>
        </th>
          <th class="acao">
          <form action="http://localhost:8080/estoque/editar/${item.id}" method="post">
            <button type="submit">Editar</button></form>
          </th>
          <th class="acao">
          <form action="http://localhost:8080/estoque/deletar/${item.id}" method="get">
            <button type="submit">Excluir</button></form>
          </th>
        </tr>
      `;
    }
    fs.readFile(t_estoque2, "utf8", function(err, data) {
      // Funcao para abrir o index.html e o editar antes de enviar ao cliente
      if (err) throw err;
  
      var $ = cheerio.load(data);
      var texto = `                
      <tr style="height: 27px;">
      <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-1">Numero</td>
      <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-2">Nome</td>
      <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-3">Quantidade</td>
      <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-4">Valor</td>
      <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-5">Categoria</td>
      </tr>`;

      for(var i=0; i<estoque.max+1; i++){
          // Criacao ordenada por id de cada elemento do estoque como um item no html
          var item = estoque.get_item(i, categoria, nome);
          if(!isNaN(id) && i != id){item = null;}
          if(item != null){  
              texto += chunck(item);
      }
    }
      
      // Edita o html aberto e o retorna ao cliente
      $(".table-produtos").html(texto);
      res.send($.html());
    });
});

app.post("/acesso", function(req, res){
    // Mostra a pag2
    var cod = parseInt(req.body['cod']);
    function validar(d){
        // valida o codigo e mostra a tela adequada
        if(d.rows.length > 0 ){
          // Existe tal codigo
          sessao.cargo = d.rows[0].cargo;
          sessao.cod_acesso = cod;
          sessao.valida = true;
          sessao.nome = d.rows[0].nome;
          fs.readFile(menu, "utf8", function(err, data) {
            if (err) throw err;
        
            var $ = cheerio.load(data);
            
            $(".bemvindo").html(`Bem vindo(a) ${sessao.cargo} ${sessao.nome}`);
            res.send($.html());
          });
        }
        else{
          res.redirect('/');
        }
    }
    if(sessao.valida && isNaN(cod)){
      cod = sessao.cod_acesso;
    }
    if(!isNaN(cod)){
      consulta("select * from public.funcionario where cod_acesso = "+cod, validar);
    }
    else{
      res.redirect("/");
    }

});

app.post("/estoque/editar/:id", function(req, res){
    // Retorna a tela para editar um item especifico do estoque
    if(!sessao.valida){
      res.redirect("/");
      return 0;
    }
    if(sessao.cargo != "gerente" && sessao.cargo != "estoquista"){
      res.redirect("/estoque");
      return 0;
    }
    var id = parseInt(req.params['id']); // Pega como parametro do URL seu id

    fs.readFile(altera, "utf8", function(err, data) {
        // Abre o html para o editar
        if (err) throw err;
        var $ = cheerio.load(data);

        var item = estoque.get_item(id, null, null);
        // Cria um elemento com os dados do item a ser editado
        
        var texto = `
        <form action="http://localhost:8080/estoque/alterar/${item.id}" method="POST" class="u-clearfix u-form-horizontal u-form-spacing-15 u-inner-form" style="padding: 15px;">
        <div class="u-form-group u-form-name u-label-top">
          <label for="nump" class="u-label">${item.id}</label>
        </div>
        <div class="u-form-group u-label-top u-form-group-2">
          <label for="np" class="u-label">Nome</label>
          <input type="text" placeholder="${item.nome}" value="${item.nome}" id="np" name="nome" class="u-border-1 u-border-grey-30 u-input u-input-rectangle">
        </div>
        <div class="u-form-group u-label-top u-form-group-3">
          <label for="vp" class="u-label">Valor</label>
          <input type="number" placeholder="${item.preco}" value="${item.preco}" id="vp" name="preco" class="u-border-1 u-border-grey-30 u-input u-input-rectangle" required>
        </div>
        <div class="u-form-group u-label-top">
          <label for="catt" class="u-label">Categoria</label>
          <input type="text" placeholder="${item.categoria}" value="${item.categoria}" id="catt" name="categoria" class="u-border-1 u-border-grey-30 u-input u-input-rectangle">
        </div>
        <div class="u-form-group u-form-submit u-label-top">
          <input type="submit" value="alterar" class="u-btn u-btn-round u-btn-submit u-button-style u-palette-3-base u-radius-50 u-btn-2">
        </div>
        </form>
        `

        // Retorna o html para o cliente
        $(".modal").html(texto);
        res.send($.html());
    });
});

app.get("/estoque/deletar/:id", function(req, res){
  // Recebe uma ordem de deletar um item e o faz
  if(!sessao.valida){
    res.redirect("/");
    return 0;
  }
  if(sessao.cargo != "gerente" && sessao.cargo != "estoquista"){
    res.redirect("/estoque");
    return 0;
  }
  var id = parseInt(req.params.id);
  console.log("Ordem para deletar o item "+id);
  estoque.remove_item(parseInt(id));
  consulta('delete from produto where numproduto = '+id, pr);
  res.redirect("/estoque");
});

app.get("/estoque/novo-item", function(req, res){
    // Requisicao para criar o novo item
    if(!sessao.valida){
      res.redirect("/");
      return 0;
    }
    if(sessao.cargo != "gerente" && sessao.cargo != "estoquista"){
      res.redirect("/estoque");
      return 0;
    }
    var data = req.query;
    var produto = new Produto();
    var id = parseInt(data.id);

    produto.set_nome(data.nome);
    produto.set_categoria(data.categoria.toLowerCase());
    produto.set_preco(parseFloat(data.preco));
    if(!isNaN(id)){
      if(estoque.get_item(id) == null){
        produto.set_id(id);
       }
       else{
        produto.set_id(estoque.get_new_id(true));
       }
    }
    else{
      produto.set_id(estoque.get_new_id(true));
    }
    estoque.add_item(produto, false);
    estoque.quantidades[data.id] = data.quantidade; 
    consulta(`insert into produto values('${produto.id}', '${produto.nome}', '${produto.preco}', '${data.quantidade}', '${produto.categoria}')`, pr);
    res.redirect("/estoque");
});

app.post("/estoque/alterar/:id", function(req, res){
    // Tela de alterar produto por id
    if(!sessao.valida){
      res.redirect("/");
      return 0;
    }
    if(sessao.cargo != "gerente" && sessao.cargo != "estoquista"){
      res.redirect("/estoque");
      return 0;
    }
    var id = parseInt(req.params.id);
    console.log("salvar " +id);
    var nome = req.body.nome;
    var preco = parseFloat(req.body.preco);
    var categoria = req.body.categoria.toLowerCase();
    
    var produto = estoque.get_item(id, null, null);
    produto.set_nome(nome);

    estoque.update_cat(produto, categoria);
    produto.set_categoria(categoria);
    
    produto.set_preco(preco);
    consulta(`update produto set nome = '${nome}', categoria = '${categoria}', valor = ${preco} where numproduto = ${id};`, pr);
    res.redirect("/estoque");
});

app.post("/estoque/qtd", function(req, res){
    // Recebe uma requisicao para alterar a quantidade de determinado item no estoque
    if(sessao.cargo != "gerente" && sessao.cargo != "estoquista"){
      res.redirect("/estoque");
      return 0;
    }
    const id = parseInt(req.body.id);
    const qtd = parseInt(req.body.nova_qtd);
    if(qtd >= 0){
        console.log("Alterando quatidade item "+id+" de "+estoque.quantidades[id]+" para "+qtd);
        estoque.quantidades[id] = qtd;
    }
    consulta('update produto set estoque ='+qtd+' where numproduto = '+id+';', pr);
    res.redirect('/estoque');
});

app.get('/logout', function(req, res){
    // Finaliza a sessao atual
    sessao.valida = false;
    sessao.nome = null;
    sessao.cargo = null;
    sessao.cod_acesso = 0;
    res.redirect("/");
});

app.get("/vendas", function(req, res){
  if(!sessao.valida){
    res.redirect("/");
    return 0;
  }
  var cod;
  function aux2(dt){
    var vf = 0;
    fs.readFile(telavenda, "utf8", function(err, data) {
      // Abre o html para o editar
      if (err) throw err;
      var $ = cheerio.load(data);
      
      var texto = `
        <tr style="height: 27px;">
        <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-1">Nome</td>
        <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-2">Quantidade</td>
        <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-3">Valor</td>
        </tr>`
      for(let item of dt.rows){
        vf += parseInt(item.valor*item.quantidade);
        texto += `
        <tr>
        <th class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-1">${item.nome}</th>
        <th class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-2">${item.quantidade}</th>
        <th class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-3">${item.valor*item.quantidade}</th>
        <th>
          <form action="http://localhost:8080/vendas/deletar/${item.produto_numproduto}" method="get">
              <button type="submit">Excluir</button>
          </form>
        </th>
        </tr>
        `
      }
      // Setar valor final

      $(".tabela-venda").html(texto);
      $(".valorfinal").html(`
      <h4 class="u-align-center u-custom-font u-font-montserrat u-text u-text-4">Valor Final:</h4>
      <h4 class="u-align-center u-custom-font u-font-montserrat u-text u-text-3">${vf}</h4>`);
      $(".lblid").html(`Venda número ${cod}`);
      res.send($.html());
  });
  }
  function aux(data){
    cod = parseInt(data.rows[0].codigovenda);
    if(data.rows[0].status != "aberta"){
      console.log("nova venda");
      var hora = new Date();
      var hor = `${hora.getFullYear()}-${hora.getMonth()}-${hora.getDay()}`
      var cpf = 45453499;
      cod += 1;
      consulta(`insert into venda values('${cod}', '0', '${hor}', '${sessao.cod_acesso}', '${sessao.cod_acesso}', '${cpf}', 'aberta');`, pr);
    }
    consulta("select * from public.item join public.produto on(numproduto = produto_numproduto) group by venda_codigovenda, produto_numproduto, numproduto having venda_codigovenda ="+cod+";", aux2);
  }
  consulta("select codigovenda, status from public.venda where codigovenda = (select max(codigovenda) from public.venda)", aux);
});

app.post("/vendas/adicionar", function(req, res){
  if(!sessao.valida){
    res.redirect("/");
    return 0;
  }
    var id = parseInt(req.body.numprodv);
    var qtd = parseInt(req.body.qntprodutov);
    var valor = 0;
    var cod;
    function aux3(data){
      var update = false;
      for(let item of data.rows){
        if(parseInt(item.produto_numproduto) == id){
          update = true;
          break;
        }
      }
      if(!update){
        consulta(`insert into item values('${id}', '${cod}', '${qtd}', '${valor}', '0');`, pr);
      }
      else{
        consulta(`update item set quantidade = ${data.rows[0].quantidade + qtd} where produto_numproduto = ${id} and venda_codigovenda = ${cod}`, pr);
      }
      res.redirect("/vendas");
    }
    function aux2(data){
      valor = parseInt(data.rows[0].v)*qtd;
      if(parseInt(data.rows[0].est) >= qtd){
        consulta(`select * from public.item group by venda_codigovenda, produto_numproduto having venda_codigovenda = ${cod}`, aux3);
      }
      else{
        // Nao ha esto que suficiente
        res.redirect("/vendas");
      }
    }
    function aux(data){
      cod = data.rows[0].max;
      consulta(`select valor as v, estoque as est from public.produto where numproduto = ${id};`, aux2);
    }
    if(!isNaN(id) && !isNaN(qtd)){
      consulta("select max(codigovenda) from public.venda", aux);
    }
});

app.get("/vendas/deletar/:id", function(req, res){
    if(!sessao.valida){
      res.redirect("/");
      return 0;
    }
    var id = parseInt(req.params.id);
    // remove no banco e de redirect
    function aux(data){
      var cod = data.rows[0].max;
      consulta(`delete from item where produto_numproduto = ${id} and venda_codigovenda = ${cod};`, pr);
      res.redirect("/vendas");
    }
    consulta(`select max(codigovenda) from public.venda`, aux);
});

app.get("/vendas/finalizar", function(req, res){
    // Marque a venda como finalizada no banco e redirec
    if(!sessao.valida){
      res.redirect("/");
      return 0;
    }
    var cod, cpf;
    var valor = 0;
    function aux2(data){
      // De update no status da venda
      for(let item of data.rows){
        valor += parseInt(item.valor);
        novoe = parseInt(item.estoque) - parseInt(item.quantidade);
        consulta(`update produto set estoque = '${novoe}' where numproduto = '${item.produto_numproduto}'`, pr);
      }
      // Precisa atualizar tambem o estoque dos itens vendidos
      consulta(`update venda set status = 'finalizada', valor = ${valor} where codigovenda = ${cod};`, pr);
      consulta('select * from public.produto;', iniciar_estoque);
      res.redirect("/vendas");
    }
    function aux(data){
      cod = data.rows[0].max;
      consulta("select * from public.item join public.produto on(numproduto = produto_numproduto) group by venda_codigovenda, produto_numproduto, numproduto having venda_codigovenda ="+cod+";", aux2);
    }
    consulta(`select max(codigovenda) from public.venda`, aux);
});

app.get("/lotes", function(req, res){
    // Mostra a tela de lotes
    if(!sessao.valida){
      res.redirect("/");
      return 0;
    }
    if(sessao.cargo != "estoquista" && sessao.cargo != "gerente"){
      return 0;
    }
    function aux(dt){
      fs.readFile(telalotes, "utf8", function(err, data) {
        // Abre o html para o editar
        if (err) throw err;
        var $ = cheerio.load(data);
        
        var texto = `
          <tr style="height: 27px;">
          <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-1">Numero</td>
          <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-2">CNPJ</td>
          <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-3">Nome</td>
          <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-4">Data</td>
          <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-5">Valor</td>
          </tr>`
        for(let item of dt.rows){
          texto += `
          <tr>
          <th class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-1">${item.numerocompra}</th>
          <th class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-2">${item.fornecedor_cnpj}</th>
          <th class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-3">${item.nome}</th>
          <th class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-4">${item.data}</th>
          <th class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-5">${item.valor}</th>
          </tr>
          `
        }
        // Setar valor final
    
        $(".table-lotes").html(texto);
        res.send($.html());
      });
    }
    consulta("select * from public.lote l join public.fornecedor f on(l.fornecedor_cnpj = f.cnpj)", aux);
});

app.post("/lotes/adicionar", function(req, res){
    if(!sessao.valida){
      res.redirect("/");
      return 0;
    }
    var num = parseInt(req.body["numcomp"]);
    var cnpj = parseInt(req.body["cnpj"]);
    var hora = req.body["data"];
    var valor = parseInt(req.body["valorL"]);
    // Verificar se o num ja nao existe, verificar se o fornecedor existe e entao fazer insert
    function aux2(data){
      if(data.rows.length == 0){
        // valido
        try{
          consulta(`insert into lote values('${num}', '${valor}', '${hora}', '${sessao.cod_acesso}', '${cnpj}')`, pr);
        }
        catch{
          console.log("Campo invalido ao adicionar lote");
        
        }
        res.redirect("/lotes"); 
      }
      else{
        res.redirect("/lotes");
      }
    }
    function aux(data){
      if(parseInt(data.rows[0].cnpj) == cnpj){
          consulta(`select * from public.lote where numerocompra = '${num}';`, aux2);
      }
      else{
        res.redirect("/lotes");
      }
    }
    consulta(`select cnpj from public.fornecedor where cnpj = ${cnpj};`, aux);
});

app.post("/lotes/busca", function(req, res){
    if(!sessao.valida){
      res.redirect("/");
      return 0;
    }
    var num = parseInt(req.body["numcomp2"]);
    var cnpj = parseInt(req.body["cnpj2"]);
    function aux(dt){
      fs.readFile(telalotes2, "utf8", function(err, data) {
        // Abre o html para o editar
        if (err) throw err;
        var $ = cheerio.load(data);
        
        var texto = `
          <tr style="height: 27px;">
          <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-1">Numero</td>
          <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-2">CNPJ</td>
          <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-3">Nome</td>
          <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-4">Data</td>
          <td class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-5">Valor</td>
          </tr>`
        for(let item of dt.rows){
          texto += `
          <tr>
          <th class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-1">${item.numerocompra}</th>
          <th class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-2">${item.fornecedor_cnpj}</th>
          <th class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-3">${item.nome}</th>
          <th class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-4">${item.data}</th>
          <th class="u-align-center u-palette-3-light-2 u-table-cell u-table-valign-middle u-table-cell-5">${item.valor}</th>
          </tr>
          `
        }
    
        $(".table-lotes").html(texto);
        res.send($.html());
      });
    }
    var texto = `select * from public.lote l join public.fornecedor f on(l.fornecedor_cnpj = f.cnpj) where f.cnpj = ${cnpj} and numerocompra = ${num}`
    if(isNaN(cnpj)){
      texto = `select * from public.lote l join public.fornecedor f on(l.fornecedor_cnpj = f.cnpj) where numerocompra = ${num}`
    }
    else if(isNaN(num)){
      texto = `select * from public.lote l join public.fornecedor f on(l.fornecedor_cnpj = f.cnpj) where f.cnpj = ${cnpj}`
    }
    if(isNaN(cnpj) && isNaN(num)){res.redirect("/lotes");return 0;}
    consulta(texto, aux);
});